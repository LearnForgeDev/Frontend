import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import SessionQueryProvider from './SessionQueryProvider';
import { createApiClient } from '@/Endpoints/factory/factory';
import { SESSION_QUERY_KEY } from '@/Services/Auth/hooks/useRestoreSession/useRestoreSession.const';

const user = { userPublicId: 'first-account', userName: 'Учитель', jwtToken: '', refreshToken: '', userRoles: [], exp: 0 };

afterEach(() => {
  cleanup();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Кеш сессии', () => {
  it('не переносит учеников и прогресс между аккаунтами', () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }: { children: ReactNode }) => <SessionQueryProvider>{children}</SessionQueryProvider>,
    });
    const previousClient = result.current;
    previousClient.setQueryData(['courses', 'school', 'course'], { students: ['private-student'], canManage: true });
    act(() => useGlobalContext.getState().auth.setUser({
      userPublicId: 'next-account', userName: 'Ученик', jwtToken: '', refreshToken: '', userRoles: [], exp: 0,
    }));
    expect(result.current).not.toBe(previousClient);
    expect(result.current.getQueryData(['courses', 'school', 'course'])).toBeUndefined();
  });

  it('выход отменяет запросы старого React-клиента', async () => {
    useGlobalContext.getState().auth.setUser(user);
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }: { children: ReactNode }) => <SessionQueryProvider>{children}</SessionQueryProvider>,
    });
    let finish!: (value: string) => void;
    let signal!: AbortSignal;
    const pending = result.current.fetchQuery({
      queryKey: ['private-school'],
      queryFn: (context) => {
        signal = context.signal;
        return new Promise<string>((resolve) => { finish = resolve; });
      },
    }).catch(() => null);
    act(() => useGlobalContext.getState().auth.logout());
    expect(signal.aborted).toBe(true);
    await act(async () => { finish('Чужие данные'); await pending; });
    expect(result.current.getQueryData(['private-school'])).toBeUndefined();
  });

  it('сбрасывает endpoint-кеш и не отдаёт старый ответ новому аккаунту', async () => {
    useGlobalContext.getState().auth.setUser(user);
    const client = createApiClient({ staleTime: Infinity });
    client.setQueryData(['members'], ['private-student']);
    let finish!: (value: string) => void;
    const pending = client.fetchQuery({
      queryKey: ['school'],
      queryFn: () => new Promise<string>((resolve) => { finish = resolve; }),
    }).catch(() => null);
    useGlobalContext.getState().auth.logout();
    expect(client.getQueryData(['members'])).toBeUndefined();
    useGlobalContext.getState().auth.setUser({ ...user, userPublicId: 'second-account' });
    expect(await client.fetchQuery({ queryKey: ['school'], queryFn: async () => 'Свои данные' })).toBe('Свои данные');
    finish('Чужие данные');
    await pending;
    expect(client.getQueryData(['school'])).toBe('Свои данные');
  });

  it('не очищает сессию активного React-клиента при записи пользователя', () => {
    const client = createApiClient({ sessionScoped: false });
    client.setQueryData(SESSION_QUERY_KEY, user);
    useGlobalContext.getState().auth.setUser(user);
    expect(client.getQueryData(SESSION_QUERY_KEY)).toEqual(user);
  });
});
