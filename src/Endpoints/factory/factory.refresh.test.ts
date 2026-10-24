import { createElement, type ReactNode } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRestoreSession } from '@/Services/Auth/hooks/useRestoreSession/useRestoreSession';
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { MILLISECONDS_PER_SECOND, REFRESH_RETRY_COUNT, REFRESH_RETRY_DELAY_MS } from '@/Endpoints/auth/auth.const';
import { getRefreshRetryDelay } from '@/Endpoints/auth/utils';
import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { createQueryFnWithRefresh } from './factory';
import { HTTP_STATUS } from './factory.const';
import {
  SESSION_TEST_EXPIRED_AT,
  SESSION_TEST_LIFETIME_MS,
  SESSION_TEST_REFRESH_PATH,
  SESSION_TEST_RESOURCE_PATH,
  SESSION_TEST_RETRY_AFTER_SECONDS,
  SESSION_TEST_SCHOOL_ID,
  SESSION_TEST_USER_ID,
} from './factory.refresh.const';

const mocks = vi.hoisted(() => ({ adapter: vi.fn() }));
vi.mock('axios', (importOriginal) => importOriginal<typeof import('axios')>().then((original) => Object.assign({}, original, {
  default: Object.assign({}, original.default, {
    create: (config: Parameters<typeof original.default.create>[0]) => {
      const client = original.default.create(config);
      client.defaults.adapter = mocks.adapter;
      return client;
    },
  }),
})));

function makeIdentity(refreshToken: string = crypto.randomUUID()): UserIdentity {
  const exp = Date.now() + SESSION_TEST_LIFETIME_MS;
  return {
    userPublicId: SESSION_TEST_USER_ID,
    userName: 'Пользователь',
    jwtToken: `header.${btoa(JSON.stringify({ exp: exp / MILLISECONDS_PER_SECOND, refreshToken }))}.signature`,
    refreshToken,
    userRoles: [],
    exp,
    activeSchoolPublicId: SESSION_TEST_SCHOOL_ID,
  };
}

function response(config: InternalAxiosRequestConfig, data: unknown = {}) {
  return { config, data, status: 200, statusText: 'OK', headers: new AxiosHeaders() };
}

function requestError(config: InternalAxiosRequestConfig, status: number, retryAfter?: string) {
  return new AxiosError('Ошибка запроса', undefined, config, undefined, {
    ...response(config), status,
    headers: new AxiosHeaders(retryAfter === undefined ? {} : { 'retry-after': retryAfter }),
  });
}

function storedIdentity(): UserIdentity {
  return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!);
}

beforeEach(() => {
  mocks.adapter.mockReset();
  useGlobalContext.getState().auth.setUser(makeIdentity());
});

afterEach(() => {
  cleanup();
  useGlobalContext.getState().auth.logout();
  vi.useRealTimers();
});

describe('Автоматическое обновление JWT', () => {
  it('обновляет истёкший JWT один раз для запросов разных клиентов и сохраняет школу', async () => {
    useGlobalContext.getState().auth.setUser({ ...makeIdentity(), exp: SESSION_TEST_EXPIRED_AT });
    const refreshed = makeIdentity('rotated-refresh');
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) =>
      response(config, config.url === SESSION_TEST_REFRESH_PATH ? refreshed : storedIdentity()));

    const results = await Promise.all([
      createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH),
      createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH),
    ]);

    expect(mocks.adapter.mock.calls.filter(([config]) => config.url === SESSION_TEST_REFRESH_PATH)).toHaveLength(1);
    expect(results.map(({ data }) => data.refreshToken)).toEqual([refreshed.refreshToken, refreshed.refreshToken]);
    expect(storedIdentity().activeSchoolPublicId).toBe(SESSION_TEST_SCHOOL_ID);
  });

  it('восстанавливает запрос после серверного 401 до локального истечения JWT', async () => {
    const refreshed = makeIdentity('server-rotated-refresh');
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (config.url === SESSION_TEST_REFRESH_PATH) return response(config, refreshed);
      if (storedIdentity().refreshToken !== refreshed.refreshToken) throw requestError(config, HTTP_STATUS.UNAUTHORIZED);
      return response(config);
    });

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).resolves.toMatchObject({ status: 200 });
    expect(mocks.adapter).toHaveBeenCalledTimes(3);
    expect(storedIdentity().refreshToken).toBe(refreshed.refreshToken);
  });

  it('не зацикливает повторный 401', async () => {
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (config.url === SESSION_TEST_REFRESH_PATH) return response(config, makeIdentity('retry-refresh'));
      throw requestError(config, HTTP_STATUS.UNAUTHORIZED);
    });

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toMatchObject({ response: { status: 401 } });
    expect(mocks.adapter).toHaveBeenCalledTimes(3);
  });

  it.each([undefined, String(SESSION_TEST_RETRY_AFTER_SECONDS)])('повторяет refresh после 429 с Retry-After %s и продолжает исходный запрос', async (retryAfter) => {
    vi.useFakeTimers();
    useGlobalContext.getState().auth.setUser({ ...makeIdentity(), exp: SESSION_TEST_EXPIRED_AT });
    let refreshAttempts = 0;
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (config.url !== SESSION_TEST_REFRESH_PATH) return response(config);
      refreshAttempts += 1;
      if (refreshAttempts === 1) throw requestError(config, HTTP_STATUS.TOO_MANY_REQUESTS, retryAfter);
      return response(config, makeIdentity(`rate-limit-refresh-${retryAfter}`));
    });

    const pending = createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH);
    const assertion = expect(pending).resolves.toMatchObject({ status: 200 });
    await vi.advanceTimersByTimeAsync(0);
    expect(refreshAttempts).toBe(1);
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(true);
    const delay = retryAfter === undefined ? REFRESH_RETRY_DELAY_MS : SESSION_TEST_RETRY_AFTER_SECONDS * MILLISECONDS_PER_SECOND;
    await vi.advanceTimersByTimeAsync(delay - 1);
    expect(refreshAttempts).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(refreshAttempts).toBe(2);
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(true);
  });

  it('ограничивает повторы постоянного 429 и сохраняет сессию', async () => {
    vi.useFakeTimers();
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      throw requestError(config, HTTP_STATUS.TOO_MANY_REQUESTS);
    });
    const pending = authEndpoints.refreshToken({ refreshToken: 'persistent-rate-limit' });
    const assertion = expect(pending).rejects.toMatchObject({ response: { status: 429 } });
    await vi.advanceTimersByTimeAsync(REFRESH_RETRY_DELAY_MS * REFRESH_RETRY_COUNT);
    await assertion;
    expect(mocks.adapter).toHaveBeenCalledTimes(REFRESH_RETRY_COUNT + 1);
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(true);
  });

  it('не обновляет JWT на обычный 429 защищённого запроса', async () => {
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      throw requestError(config, HTTP_STATUS.TOO_MANY_REQUESTS);
    });
    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toMatchObject({ response: { status: 429 } });
    expect(mocks.adapter).toHaveBeenCalledOnce();
  });

  it.each(['logout', 'switch'] as const)('не восстанавливает прежнюю сессию при %s во время refresh', async (action) => {
    useGlobalContext.getState().auth.setUser({ ...makeIdentity(), exp: SESSION_TEST_EXPIRED_AT });
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (action === 'logout') useGlobalContext.getState().auth.logout();
      else useGlobalContext.getState().auth.setUser({ ...makeIdentity('next-account-refresh'), userPublicId: 'next-user' });
      return response(config, makeIdentity('late-refresh'));
    });
    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toBeDefined();
    expect(useGlobalContext.getState().auth.user?.userPublicId).toBe(action === 'logout' ? undefined : 'next-user');
    expect(mocks.adapter).toHaveBeenCalledOnce();
  });


  it('восстанавливает страницу после 429 на начальном refresh без выхода из аккаунта', async () => {
    const refreshed = makeIdentity('restored-after-rate-limit');
    let attempts = 0;
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      attempts += 1;
      if (attempts === 1) throw requestError(config, HTTP_STATUS.TOO_MANY_REQUESTS, '0');
      return response(config, refreshed);
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client }, children);
    const { result } = renderHook(() => useRestoreSession(), { wrapper });
    await waitFor(() => expect(result.current.user?.refreshToken).toBe(refreshed.refreshToken));
    expect(result.current.isError).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(storedIdentity().activeSchoolPublicId).toBe(SESSION_TEST_SCHOOL_ID);
    expect(attempts).toBe(2);
    client.clear();
  });

  it('объединяет refresh при одновременных 401 и повторяет оба исходных запроса', async () => {
    const refreshed = makeIdentity('parallel-401-refresh');
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (config.url === SESSION_TEST_REFRESH_PATH) return response(config, refreshed);
      if (storedIdentity().refreshToken !== refreshed.refreshToken) throw requestError(config, HTTP_STATUS.UNAUTHORIZED);
      return response(config);
    });
    const results = await Promise.all([
      createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH),
      createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH),
    ]);
    expect(results.every(({ status }) => status === 200)).toBe(true);
    expect(mocks.adapter.mock.calls.filter(([config]) => config.url === SESSION_TEST_REFRESH_PATH)).toHaveLength(1);
  });

  it('отменяет ожидание 429 при выходе и не отправляет новый refresh', async () => {
    vi.useFakeTimers();
    useGlobalContext.getState().auth.setUser({ ...makeIdentity(), exp: SESSION_TEST_EXPIRED_AT });
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      throw requestError(config, HTTP_STATUS.TOO_MANY_REQUESTS);
    });
    const pending = createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH);
    const assertion = expect(pending).rejects.toBeDefined();
    await vi.advanceTimersByTimeAsync(0);
    act(() => useGlobalContext.getState().auth.logout());
    await vi.advanceTimersByTimeAsync(REFRESH_RETRY_DELAY_MS * REFRESH_RETRY_COUNT);
    await assertion;
    expect(mocks.adapter).toHaveBeenCalledOnce();
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });

  it.each([HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN, HTTP_STATUS.SERVER_ERROR])('не повторяет refresh при статусе %s', async (status) => {
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      throw requestError(config, status);
    });
    await expect(authEndpoints.refreshToken({ refreshToken: crypto.randomUUID() })).rejects.toMatchObject({ response: { status } });
    expect(mocks.adapter).toHaveBeenCalledOnce();
  });

  it('учитывает дату Retry-After', () => {
    vi.useFakeTimers();
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
    const retryAt = Math.ceil(Date.now() / MILLISECONDS_PER_SECOND) * MILLISECONDS_PER_SECOND + REFRESH_RETRY_DELAY_MS;
    expect(getRefreshRetryDelay(requestError(config, HTTP_STATUS.TOO_MANY_REQUESTS, new Date(retryAt).toUTCString())))
      .toBe(retryAt - Date.now());
  });
});
