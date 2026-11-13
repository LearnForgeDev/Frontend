import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

import { AuthRole, type UserIdentity } from '@/Assets/Types/commonTypes';

import { MILLISECONDS_PER_SECOND } from '@/Endpoints/auth/auth.const';

import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';

import { SESSION_TEST_LIFETIME_MS, SESSION_TEST_SCHOOL_ID, SESSION_TEST_USER_ID } from "@/Endpoints/factory/factory.refresh.const";

export function makeIdentity(refreshToken: string = crypto.randomUUID(), exp = Date.now() + SESSION_TEST_LIFETIME_MS): UserIdentity {
  const userRoles = [{ id: 2, role: AuthRole.TEACHER, schoolId: SESSION_TEST_SCHOOL_ID, userId: 2 }];
  return {
    userPublicId: SESSION_TEST_USER_ID,
    userName: 'Пользователь',
    jwtToken: `header.${btoa(JSON.stringify({ exp: exp / MILLISECONDS_PER_SECOND, refreshToken }))}.signature`,
    refreshToken,
    userRoles,
    exp,
    activeSchoolPublicId: SESSION_TEST_SCHOOL_ID,
  };
}

export function response(config: InternalAxiosRequestConfig, data: unknown = {}) {
  return { config, data, status: 200, statusText: 'OK', headers: new AxiosHeaders() };
}

export function requestError(config: InternalAxiosRequestConfig, status: number, retryAfter?: string) {
  return new AxiosError('Ошибка запроса', undefined, config, undefined, {
    ...response(config), status,
    headers: new AxiosHeaders(retryAfter === undefined ? {} : { 'retry-after': retryAfter }),
  });
}

export function storedIdentity(): UserIdentity {
  return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!);
}