import { QueryClient } from '@tanstack/react-query'
import axios, { AxiosError, isAxiosError } from "axios";
import type { UserIdentity } from "@/Assets/Types/commonTypes.ts";
import { USER_STORAGE_KEY } from "@/Storage/UserContext/UserContext.tsx";
import config from "src/config.ts";

export function createApiClient({retryCount = 3, staleTime = 0}) {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: (failureCount, error) => {
                    if (retryCount >= failureCount) {
                        return false;
                    }

                    if (!isAxiosError(error) || !error.status) {
                        return false;
                    }

                    return !(error.status >= 400 && error.status < 500);
                },
                staleTime,
                retryDelay: (attempt) => Math.min(500 * Math.pow(2, attempt), 30000),
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
            },
        }
    })
}

export function createQueryFnWithRefresh() {
    const instance = axios.create({
        baseURL: config.endpointUrl,
        withCredentials: true,
    });

    instance.interceptors.request.use(
        async (config) => {
            const userData = localStorage.getItem(USER_STORAGE_KEY);
            if (!userData) {
                return Promise.reject(new AxiosError('User not authenticated', '401'));
            }

            const parsedUserData = JSON.parse(userData) as UserIdentity;
            const currentTime = new Date().getTime();

            if (currentTime >= parsedUserData.exp) {
                const { authEndpoints } = await import('../auth/auth.endpoints');
                await authEndpoints.refreshToken({ refreshToken: parsedUserData.refreshToken });
            }

            return config;
        },
        (error) => Promise.reject(error),
    );

    return instance;
}

export function createQueryFn() {
    return axios.create({
        baseURL: config.endpointUrl,
        withCredentials: true,
    })
}