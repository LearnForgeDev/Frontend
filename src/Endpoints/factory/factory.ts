import { QueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';
import { normalizeRestoredSession } from '@/Endpoints/auth/utils';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import config from 'src/config.ts';
import { FILE_TRANSFER_TIMEOUT_MS, MAX_RETRY_DELAY_MS, REQUEST_TIMEOUT_MS, RETRY_DELAY_MS } from './factory.const';
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

export function createQueryFnWithRefresh() {
  const instance = createQueryFn();

  instance.interceptors.request.use(async (requestConfig) => {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) throw createUnauthenticatedError();
    const parsedUserData = JSON.parse(userData) as UserIdentity;

    if (Date.now() >= parsedUserData.exp) {
      const { authEndpoints } = await import('../auth/auth.endpoints');
      const refreshed = await authEndpoints.refreshToken({ refreshToken: parsedUserData.refreshToken });
      const user = normalizeRestoredSession(refreshed);
      if (!user) throw createUnauthenticatedError();
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      const auth = useGlobalContext.getState().auth;
      if (!auth.isAuthenticated || auth.user?.userPublicId !== parsedUserData.userPublicId) {
        throw createUnauthenticatedError();
      }
      if (stored !== userData) {
        if (matchesRefreshedSession(stored, user, auth.user.userPublicId)) return requestConfig;
        throw createUnauthenticatedError();
      }
      auth.setUser({ ...user, activeSchoolPublicId: parsedUserData.activeSchoolPublicId });
    }
    return requestConfig;
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
