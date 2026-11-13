import { makeIdentity, response, requestError, storedIdentity } from '@/Services/Auth/sessionRefresh.testSupport';
import type * as AxiosModule from 'axios';
import { createElement, type ReactNode } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRestoreSession } from '@/Services/Auth/hooks/useRestoreSession/useRestoreSession';
import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthRole } from '@/Assets/Types/commonTypes';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { MILLISECONDS_PER_SECOND, REFRESH_RETRY_COUNT, REFRESH_RETRY_DELAY_MS } from '@/Endpoints/auth/auth.const';
import { getRefreshRetryDelay } from '@/Endpoints/auth/utils';
import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { createQueryFnWithRefresh } from './factory';
import { HTTP_STATUS } from './factory.const';
import { SESSION_TEST_EXPIRED_AT, SESSION_TEST_LIFETIME_MS, SESSION_TEST_REFRESH_PATH, SESSION_TEST_RESOURCE_PATH, SESSION_TEST_RETRY_AFTER_SECONDS, SESSION_TEST_SCHOOL_ID, SESSION_TEST_USER_ID } from './factory.refresh.const';

const mocks = vi.hoisted(() => ({ adapter: vi.fn() }));
vi.mock('axios', (importOriginal) => importOriginal<typeof AxiosModule>().then((original) => Object.assign({}, original, {
  default: Object.assign({}, original.default, {
    create: (config: Parameters<typeof original.default.create>[0]) => {
      const client = original.default.create(config);
      client.defaults.adapter = mocks.adapter;
      return client;
    },
  }),
})));

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
  it('принимает настоящий формат ролей login с публичным GUID школы', async () => {
    const identity = makeIdentity('login-public-school');
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => response(config, identity));

    const result = await authEndpoints.login({ name: 'Ученик', password: 'password' });

    expect(result.userRoles).toEqual([{ id: 2, role: AuthRole.TEACHER, schoolId: SESSION_TEST_SCHOOL_ID, userId: 2 }]);
    expect(result.exp).toBe(identity.exp);
  });

  it.each([null, '{invalid', '{}'])('очищает непригодные текущие credentials %s до отправки запроса', async (stored) => {
    if (stored === null) {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    else {
      localStorage.setItem(USER_STORAGE_KEY, stored);
    }

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toBeDefined();

    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(mocks.adapter).not.toHaveBeenCalled();
  });

  it.each(['login', 'register', 'joinSchool'] as const)('не возвращает некорректную новую identity из %s', async (operation) => {
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => response(config, { ...makeIdentity(), jwtToken: 'invalid' }));

    const pending = operation === 'login' ? authEndpoints.login({ name: 'Ученик', password: 'password' })
      : operation === 'register' ? authEndpoints.register({ name: 'Ученик', password: 'password', confirmPassword: 'password' })
        : authEndpoints.joinSchool({ inviteToken: 'invite' });

    await expect(pending).rejects.toMatchObject({ status: HTTP_STATUS.UNAUTHORIZED });
    expect(storedIdentity().jwtToken).not.toBe('invalid');
  });

  it('обновляет истёкший JWT один раз для запросов разных клиентов и сохраняет школу', async () => {
    useGlobalContext.getState().auth.setUser(makeIdentity(undefined, SESSION_TEST_EXPIRED_AT));
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
      if (config.url === SESSION_TEST_REFRESH_PATH) {
        return response(config, refreshed);
      }
      if (storedIdentity().refreshToken !== refreshed.refreshToken) {
        throw requestError(config, HTTP_STATUS.UNAUTHORIZED);
      }
      return response(config);
    });

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).resolves.toMatchObject({ status: 200 });
    expect(mocks.adapter).toHaveBeenCalledTimes(3);
    expect(storedIdentity().refreshToken).toBe(refreshed.refreshToken);
  });

  it('не зацикливает повторный 401', async () => {
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (config.url === SESSION_TEST_REFRESH_PATH) {
        return response(config, makeIdentity('retry-refresh'));
      }
      throw requestError(config, HTTP_STATUS.UNAUTHORIZED);
    });

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toMatchObject({ response: { status: 401 } });
    expect(mocks.adapter).toHaveBeenCalledTimes(3);
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });

  it('сохраняет подтверждённую сессию после отклонённого приглашения и позволяет повтор с новой ссылкой', async () => {
    const refreshed = makeIdentity('invite-refresh');
    let joinAttempts = 0;
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (config.url === SESSION_TEST_REFRESH_PATH) {
        return response(config, refreshed);
      }
      joinAttempts += 1;
      if (joinAttempts <= 2) {
        throw requestError(config, HTTP_STATUS.UNAUTHORIZED);
      }
      return response(config, refreshed);
    });

    await expect(authEndpoints.joinSchool({ inviteToken: 'revoked-invite' })).rejects.toMatchObject({ response: { status: HTTP_STATUS.UNAUTHORIZED } });

    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(true);
    expect(storedIdentity().refreshToken).toBe(refreshed.refreshToken);
    expect(mocks.adapter.mock.calls.filter(([config]) => config.url === SESSION_TEST_REFRESH_PATH)).toHaveLength(1);
    await expect(authEndpoints.joinSchool({ inviteToken: 'new-valid-invite' })).resolves.toMatchObject({ userPublicId: SESSION_TEST_USER_ID });
    expect(joinAttempts).toBe(3);
  });

  it.each([HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN])('очищает сессию после отклонённого refresh %s при вступлении по приглашению', async (status) => {
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      throw requestError(config, config.url === SESSION_TEST_REFRESH_PATH ? status : HTTP_STATUS.UNAUTHORIZED);
    });

    await expect(authEndpoints.joinSchool({ inviteToken: `invite-rejected-refresh-${status}` })).rejects.toBeDefined();

    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(mocks.adapter).toHaveBeenCalledTimes(2);
  });

  it.each([HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN])('очищает текущую сессию после отклонённого refresh %s', async (status) => {
    useGlobalContext.getState().auth.setUser(makeIdentity(undefined, SESSION_TEST_EXPIRED_AT));
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      throw requestError(config, status);
    });

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toBeDefined();

    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(mocks.adapter).toHaveBeenCalledOnce();
  });

  it('проверяет истечение JWT, когда сохранённый exp ошибочно обещает ещё час', async () => {
    useGlobalContext.getState().auth.setUser({ ...makeIdentity(undefined, SESSION_TEST_EXPIRED_AT), exp: Date.now() + SESSION_TEST_LIFETIME_MS });
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) =>
      response(config, config.url === SESSION_TEST_REFRESH_PATH ? makeIdentity() : {}));

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).resolves.toMatchObject({ status: 200 });

    expect(mocks.adapter.mock.calls[0][0].url).toBe(SESSION_TEST_REFRESH_PATH);
    expect(mocks.adapter).toHaveBeenCalledTimes(2);
  });

  it('очищает сессию после непригодного ответа refresh', async () => {
    useGlobalContext.getState().auth.setUser(makeIdentity(undefined, SESSION_TEST_EXPIRED_AT));
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => response(config, { jwtToken: 'invalid' }));

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toBeDefined();

    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });

  it('сохраняет сессию при временном сбое refresh для повторной попытки', async () => {
    const identity = makeIdentity(undefined, SESSION_TEST_EXPIRED_AT);
    useGlobalContext.getState().auth.setUser(identity);
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      throw requestError(config, HTTP_STATUS.SERVER_ERROR);
    });

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toBeDefined();

    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(true);
    expect(storedIdentity().refreshToken).toBe(identity.refreshToken);
  });

  it('отклонённый старый refresh не удаляет новый аккаунт', async () => {
    useGlobalContext.getState().auth.setUser(makeIdentity(undefined, SESSION_TEST_EXPIRED_AT));
    const nextIdentity = { ...makeIdentity(), userPublicId: 'next-account' };
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      useGlobalContext.getState().auth.setUser(nextIdentity);
      throw requestError(config, HTTP_STATUS.UNAUTHORIZED);
    });

    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toBeDefined();

    expect(useGlobalContext.getState().auth.user?.userPublicId).toBe(nextIdentity.userPublicId);
    expect(storedIdentity().refreshToken).toBe(nextIdentity.refreshToken);
  });

  it('не завершает защищённую операцию поздним ответом после выхода', async () => {
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      useGlobalContext.getState().auth.logout();
      return response(config, makeIdentity());
    });

    await expect(createQueryFnWithRefresh().post(SESSION_TEST_RESOURCE_PATH)).rejects.toBeDefined();

    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });

  it.each([undefined, String(SESSION_TEST_RETRY_AFTER_SECONDS)])('повторяет refresh после 429 с Retry-After %s и продолжает исходный запрос', async (retryAfter) => {
    vi.useFakeTimers();
    useGlobalContext.getState().auth.setUser(makeIdentity(undefined, SESSION_TEST_EXPIRED_AT));
    let refreshAttempts = 0;
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (config.url !== SESSION_TEST_REFRESH_PATH) {
        return response(config);
      }
      refreshAttempts += 1;
      if (refreshAttempts === 1) {
        throw requestError(config, HTTP_STATUS.TOO_MANY_REQUESTS, retryAfter);
      }
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
    useGlobalContext.getState().auth.setUser(makeIdentity(undefined, SESSION_TEST_EXPIRED_AT));
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (action === 'logout') {
        useGlobalContext.getState().auth.logout();
      }
      else {
        useGlobalContext.getState().auth.setUser({ ...makeIdentity('next-account-refresh'), userPublicId: 'next-user' });
      }
      return response(config, makeIdentity('late-refresh'));
    });
    await expect(createQueryFnWithRefresh().get(SESSION_TEST_RESOURCE_PATH)).rejects.toBeDefined();
    expect(useGlobalContext.getState().auth.user?.userPublicId).toBe(action === 'logout' ? undefined : 'next-user');
    expect(mocks.adapter).toHaveBeenCalledOnce();
  });

  it('восстанавливает страницу после 429 на начальном refresh без выхода из аккаунта', async () => {
    const stored = localStorage.getItem(USER_STORAGE_KEY)!;
    useGlobalContext.getState().auth.logout();
    localStorage.setItem(USER_STORAGE_KEY, stored);
    const refreshed = makeIdentity('restored-after-rate-limit');
    let attempts = 0;
    mocks.adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      attempts += 1;
      if (attempts === 1) {
        throw requestError(config, HTTP_STATUS.TOO_MANY_REQUESTS, '0');
      }
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
      if (config.url === SESSION_TEST_REFRESH_PATH) {
        return response(config, refreshed);
      }
      if (storedIdentity().refreshToken !== refreshed.refreshToken) {
        throw requestError(config, HTTP_STATUS.UNAUTHORIZED);
      }
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
    useGlobalContext.getState().auth.setUser(makeIdentity(undefined, SESSION_TEST_EXPIRED_AT));
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
