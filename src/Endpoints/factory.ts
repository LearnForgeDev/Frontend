import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

import { useGlobalContext } from '@/Storage/Context/useGlobalContext';

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

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

  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
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
        await axios.post(`${baseURL}/api/ApiAuth/refreshToken`, undefined, {
          withCredentials: true,
        });

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
