import { QueryClient } from '@tanstack/react-query'
import axios, { AxiosError, isAxiosError } from "axios";
import type { UserIdentity } from "@/Assets/Types/commonTypes.ts";
import { USER_STORAGE_KEY } from "@/Storage/UserContext/UserContext.const";
import config from "src/config.ts";
import { normalizeRestoredSession } from '@/Endpoints/auth/utils';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { matchesRefreshedSession } from './factory.utils';

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
                const refreshed = await authEndpoints.refreshToken({ refreshToken: parsedUserData.refreshToken });
                const user = normalizeRestoredSession(refreshed);
                if (!user) return Promise.reject(new AxiosError('Invalid session', '401'));
                const stored = localStorage.getItem(USER_STORAGE_KEY);
                const auth = useGlobalContext.getState().auth;
                if (!auth.isAuthenticated || auth.user?.userPublicId !== parsedUserData.userPublicId) {
                    return Promise.reject(new AxiosError('Session changed', '401'));
                }
                if (stored !== userData) {
                    if (matchesRefreshedSession(stored, user, auth.user.userPublicId)) return config;
                    return Promise.reject(new AxiosError('Session changed', '401'));
                }
                useGlobalContext.getState().auth.setUser({ ...user, activeSchoolPublicId: parsedUserData.activeSchoolPublicId });
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