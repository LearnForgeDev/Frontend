import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

import { useGlobalContext } from '@/Storage/Context/useGlobalContext';
import { USER_STORAGE_KEY } from '@/Storage/Context/UserContext';

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];
let sequentialErrorCount = 0;
const MAX_SEQUENTIAL_ERRORS = 5;

function subscribeToRefresh(cb: () => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

export interface AppError {
  message: string;
  code: string;
  status?: number;
}

function normaliseError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message ?? error.message,
      code: error.response?.data?.code ?? 'UNKNOWN',
      status: error.response?.status,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'Unexpected error',
    code: 'UNKNOWN',
  };
}

export function createApiClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 15_000,
    withCredentials: true
  });

  instance.interceptors.request.use((config) => {
    if (sequentialErrorCount >= MAX_SEQUENTIAL_ERRORS) {
      return Promise.reject(new Error('Requests blocked due to multiple sequential errors.'));
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => {
      sequentialErrorCount = 0;
      return res;
    },
    async (error) => {
      sequentialErrorCount++;
      const originalRequest = error.config;
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(normaliseError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeToRefresh(() => {
            resolve(instance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedStr = localStorage.getItem(USER_STORAGE_KEY);
        const storedUser = storedStr ? JSON.parse(storedStr) : null;
        const refreshToken = storedUser?.refreshToken;

        if (!refreshToken) {
          useGlobalContext.getState().auth.logout();
          return Promise.reject(new Error('No refresh token'));
        }

        const refreshRes = await axios.post(`${baseURL}/api/ApiAuth/refreshToken`, { refreshToken }, {
          withCredentials: true,
        });

        const result = refreshRes.data;
        if (result && result.refreshToken) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ ...storedUser, ...result }));
          useGlobalContext.getState().auth.setUser(result);
        }

        onRefreshed();
        return instance(originalRequest);
      } catch (refreshErr) {
        useGlobalContext.getState().auth.logout();
        return Promise.reject(normaliseError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }
  );

  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (err) =>
      axiosRetry.isNetworkOrIdempotentRequestError(err) ||
      (err.response?.status ?? 0) >= 500,
  });

  return instance;
}
