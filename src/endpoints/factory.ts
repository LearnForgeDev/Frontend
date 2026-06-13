/* eslint-disable no-empty */
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { refreshToken } from '@/Endpoints/apiAuth';
import { USER_STORAGE_KEY } from '@/Storage/Context/UserContext';
import type { UserIdentity } from '@/Assets/Types/commonTypes';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeToRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
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
  const instance = axios.create({ baseURL, timeout: 15_000 });

  // Attach token interceptor
  instance.interceptors.request.use((config) => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          const user = JSON.parse(stored) as UserIdentity;
          if (user?.jwtToken) {
            config.headers.Authorization = `Bearer ${user.jwtToken}`;
          }
        }
      }
    } catch (err) {
      console.error('Failed to attach access token to request:', err);
    }
    return config;
  });

  // Handle 401 response with silent refresh interceptor
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(normaliseError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeToRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(instance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (typeof window === 'undefined') {
          throw new Error('Not running in a browser environment');
        }

        const stored = localStorage.getItem(USER_STORAGE_KEY);
        if (!stored) throw new Error('No stored session credentials');
        const user = JSON.parse(stored) as UserIdentity;
        if (!user.refreshToken) throw new Error('No refresh token found');

        const data = await refreshToken({ refreshToken: user.refreshToken });
        const newJwtToken = data.jwtToken;

        onRefreshed(newJwtToken);
        originalRequest.headers.Authorization = `Bearer ${newJwtToken}`;
        return instance(originalRequest);
      } catch (refreshErr) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(USER_STORAGE_KEY);
          } catch { }
          window.location.href = '/Frontend/auth/login';
        }
        return Promise.reject(normaliseError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }
  );

  // Retry 5xx + network errors
  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (err) =>
      axiosRetry.isNetworkOrIdempotentRequestError(err) ||
      (err.response?.status ?? 0) >= 500,
  });

  return instance;
}
