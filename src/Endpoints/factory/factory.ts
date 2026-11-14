import type { SessionRequestConfig, RequestSession } from './factory.type';
import { QueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';
import { getJwtExpiry, normalizeRestoredSession } from '@/Endpoints/auth/utils';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import config from 'src/config.ts';
import { FILE_TRANSFER_TIMEOUT_MS, HTTP_STATUS, MAX_RETRY_DELAY_MS, REQUEST_TIMEOUT_MS, RETRY_DELAY_MS } from './factory.const';
import { createUnauthenticatedError, getRequestErrorMessage, isRejectedAuthentication, matchesRefreshedSession, shouldRetryRequest } from './factory.utils';

export function createApiClient({ retryCount = 0, staleTime = 0, sessionScoped = true } = {}) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: sessionScoped ? 'always' : 'online',
        retry: (failureCount, error) => shouldRetryRequest(failureCount, error, retryCount),
        staleTime,
        retryDelay: (attempt) => Math.min(RETRY_DELAY_MS * Math.pow(2, attempt), MAX_RETRY_DELAY_MS),
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
        networkMode: 'always',
      },
    },
  });
  if (sessionScoped) {
    useGlobalContext.subscribe((state, previous) => {
      if (state.auth.user?.userPublicId !== previous.auth.user?.userPublicId) {
        client.clear();
      }
    });
  }
  return client;
}

function readRequestSession(): RequestSession {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    const user: unknown = stored ? JSON.parse(stored) : null;
    const auth = useGlobalContext.getState().auth;
    if (user && typeof user === 'object' &&
      'jwtToken' in user && typeof user.jwtToken === 'string' &&
      'refreshToken' in user && typeof user.refreshToken === 'string' && user.refreshToken.trim() &&
      'userPublicId' in user && typeof user.userPublicId === 'string' &&
      auth.isAuthenticated && auth.user?.userPublicId === user.userPublicId) {
      return {
        jwtToken: user.jwtToken,
        refreshToken: user.refreshToken,
        userPublicId: user.userPublicId,
        ...('activeSchoolPublicId' in user && typeof user.activeSchoolPublicId === 'string'
          ? { activeSchoolPublicId: user.activeSchoolPublicId } : {}),
      };
    }
  } catch {
    useGlobalContext.getState().auth.logout();
    throw createUnauthenticatedError();
  }
  useGlobalContext.getState().auth.logout();
  throw createUnauthenticatedError();
}

let pendingSessionRefresh: { refreshToken: string; promise: Promise<void> } | undefined;

function clearRequestSession(identity: RequestSession) {
  try {
    const current = readRequestSession();
    if (current.userPublicId === identity.userPublicId && current.jwtToken === identity.jwtToken && current.refreshToken === identity.refreshToken) {
      useGlobalContext.getState().auth.logout();
    }
  } catch {
    return;
  }
}

function refreshRequestSession(identity: RequestSession): Promise<void> {
  if (pendingSessionRefresh?.refreshToken === identity.refreshToken) {
    return pendingSessionRefresh.promise;
  }
  const promise = applyRefreshedSession(identity).catch((error: unknown) => {
    if (isRejectedAuthentication(error)) {
      clearRequestSession(identity);
    }
    throw error;
  }).finally(() => {
    if (pendingSessionRefresh?.promise === promise) {
      pendingSessionRefresh = undefined;
    }
  });
  pendingSessionRefresh = { refreshToken: identity.refreshToken, promise };
  return promise;
}

async function applyRefreshedSession(identity: RequestSession) {
  const { authEndpoints } = await import('../auth/auth.endpoints');
  const refreshed = await authEndpoints.refreshToken({ refreshToken: identity.refreshToken });
  const user = normalizeRestoredSession(refreshed);
  if (!user || user.userPublicId !== identity.userPublicId) {
    throw createUnauthenticatedError();
  }
  const current = readRequestSession();
  if (current.userPublicId !== identity.userPublicId) {
    throw createUnauthenticatedError();
  }
  if (current.jwtToken !== identity.jwtToken || current.refreshToken !== identity.refreshToken) {
    if (matchesRefreshedSession(localStorage.getItem(USER_STORAGE_KEY), user, current.userPublicId)) {
      return;
    }
    throw createUnauthenticatedError();
  }
  useGlobalContext.getState().auth.setUser({ ...user, activeSchoolPublicId: current.activeSchoolPublicId });
}

export function createQueryFnWithRefresh({ invalidateSessionOnRepeated401 = true } = {}) {
  const instance = createQueryFn();

  instance.interceptors.request.use(async (requestConfig: SessionRequestConfig) => {
    let identity = readRequestSession();
    if (requestConfig.sessionIdentity && requestConfig.sessionIdentity.userPublicId !== identity.userPublicId) {
      throw createUnauthenticatedError();
    }
    const expiry = getJwtExpiry(identity.jwtToken);
    if (expiry === null || Date.now() >= expiry) {
      await refreshRequestSession(identity);
      identity = readRequestSession();
    }
    requestConfig.sessionIdentity = identity;
    return requestConfig;
  });

  instance.interceptors.response.use((response) => {
    const requestedIdentity = (response.config as SessionRequestConfig).sessionIdentity;
    if (requestedIdentity && readRequestSession().userPublicId !== requestedIdentity.userPublicId) {
      throw createUnauthenticatedError();
    }
    return response;
  }, async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== HTTP_STATUS.UNAUTHORIZED) {
      throw error;
    }
    const requestConfig = error.config as SessionRequestConfig | undefined;
    if (!requestConfig?.sessionIdentity) {
      throw error;
    }
    if (requestConfig.sessionRetried) {
      if (invalidateSessionOnRepeated401) {
        clearRequestSession(requestConfig.sessionIdentity);
      }
      throw error;
    }
    const identity = readRequestSession();
    const requestedIdentity = requestConfig.sessionIdentity;
    if (identity.userPublicId !== requestedIdentity.userPublicId) {
      throw createUnauthenticatedError();
    }
    requestConfig.sessionRetried = true;
    if (identity.jwtToken === requestedIdentity.jwtToken && identity.refreshToken === requestedIdentity.refreshToken) {
      await refreshRequestSession(identity);
    }
    return instance.request(requestConfig);
  });

  return instance;
}

export function createQueryFn() {
  const instance = axios.create({
    baseURL: config.endpointUrl,
    withCredentials: true,
    timeout: REQUEST_TIMEOUT_MS,
  });

  instance.interceptors.request.use((requestConfig) => {
    const isFileTransfer = requestConfig.data instanceof FormData
      || requestConfig.responseType === 'arraybuffer'
      || requestConfig.responseType === 'blob';
    if (isFileTransfer && requestConfig.timeout === REQUEST_TIMEOUT_MS) {
      requestConfig.timeout = FILE_TRANSFER_TIMEOUT_MS;
    }
    return requestConfig;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError(error)) {
        error.message = getRequestErrorMessage(error);
      }
      return Promise.reject(error);
    },
  );

  return instance;
}
