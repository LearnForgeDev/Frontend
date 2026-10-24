import { QueryClient } from '@tanstack/react-query';
import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';
import { normalizeRestoredSession } from '@/Endpoints/auth/utils';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import config from 'src/config.ts';
import { FILE_TRANSFER_TIMEOUT_MS, HTTP_STATUS, MAX_RETRY_DELAY_MS, REQUEST_TIMEOUT_MS, RETRY_DELAY_MS } from './factory.const';
import { createUnauthenticatedError, getRequestErrorMessage, matchesRefreshedSession, shouldRetryRequest } from './factory.utils';

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
      },
    },
  });
  if (sessionScoped) {
    useGlobalContext.subscribe((state, previous) => {
      if (state.auth.user?.userPublicId !== previous.auth.user?.userPublicId) client.clear();
    });
  }
  return client;
}

type SessionRequestConfig = InternalAxiosRequestConfig & {
  sessionIdentity?: UserIdentity;
  sessionRetried?: boolean;
};

function readRequestSession(): UserIdentity {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    const user = stored ? JSON.parse(stored) as UserIdentity : null;
    const auth = useGlobalContext.getState().auth;
    if (user?.refreshToken && auth.isAuthenticated && auth.user?.userPublicId === user.userPublicId) return user;
  } catch {
    throw createUnauthenticatedError();
  }
  throw createUnauthenticatedError();
}

let pendingSessionRefresh: { refreshToken: string; promise: Promise<void> } | undefined;

function refreshRequestSession(identity: UserIdentity): Promise<void> {
  if (pendingSessionRefresh?.refreshToken === identity.refreshToken) return pendingSessionRefresh.promise;
  const promise = applyRefreshedSession(identity).finally(() => {
    if (pendingSessionRefresh?.promise === promise) pendingSessionRefresh = undefined;
  });
  pendingSessionRefresh = { refreshToken: identity.refreshToken, promise };
  return promise;
}

async function applyRefreshedSession(identity: UserIdentity) {
  const { authEndpoints } = await import('../auth/auth.endpoints');
  const refreshed = await authEndpoints.refreshToken({ refreshToken: identity.refreshToken });
  const user = normalizeRestoredSession(refreshed);
  if (!user || user.userPublicId !== identity.userPublicId) throw createUnauthenticatedError();
  const current = readRequestSession();
  if (current.userPublicId !== identity.userPublicId) throw createUnauthenticatedError();
  if (current.jwtToken !== identity.jwtToken || current.refreshToken !== identity.refreshToken) {
    if (matchesRefreshedSession(localStorage.getItem(USER_STORAGE_KEY), user, current.userPublicId)) return;
    throw createUnauthenticatedError();
  }
  useGlobalContext.getState().auth.setUser({ ...user, activeSchoolPublicId: current.activeSchoolPublicId });
}

export function createQueryFnWithRefresh() {
  const instance = createQueryFn();

  instance.interceptors.request.use(async (requestConfig: SessionRequestConfig) => {
    let identity = readRequestSession();
    if (requestConfig.sessionIdentity && requestConfig.sessionIdentity.userPublicId !== identity.userPublicId) {
      throw createUnauthenticatedError();
    }
    if (Date.now() >= identity.exp) {
      await refreshRequestSession(identity);
      identity = readRequestSession();
    }
    requestConfig.sessionIdentity = identity;
    return requestConfig;
  });

  instance.interceptors.response.use(undefined, async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== HTTP_STATUS.UNAUTHORIZED) throw error;
    const requestConfig = error.config as SessionRequestConfig | undefined;
    if (!requestConfig?.sessionIdentity || requestConfig.sessionRetried) throw error;
    const identity = readRequestSession();
    const requestedIdentity = requestConfig.sessionIdentity;
    if (identity.userPublicId !== requestedIdentity.userPublicId) throw createUnauthenticatedError();
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
      if (isAxiosError(error)) error.message = getRequestErrorMessage(error);
      return Promise.reject(error);
    },
  );

  return instance;
}
