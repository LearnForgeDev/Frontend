import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { FormEvent, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';
import { useRestoreSession } from './useRestoreSession/useRestoreSession';
import { useAuthForm } from './useAuthForm/useAuthForm';

const mocks = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), refreshToken: vi.fn(), toast: vi.fn() }));
vi.mock('@/Endpoints', () => ({ authEndpoints: mocks }));
vi.mock('@/Endpoints/auth/auth.endpoints', () => ({ authEndpoints: mocks }));
vi.mock('@/Endpoints/auth/utils', () => ({ normalizeRestoredSession: (value: unknown) => value }));
vi.mock('@/Storage/UserContext/UserContext', () => ({ useUser: () => ({ setUser: vi.fn() }) }));
vi.mock('@/Storage/useToastStore', () => ({
  ToastSeverity: { ERROR: 'error' },
  useToastStore: { getState: () => ({ addToast: mocks.toast }) },
  useToast: () => ({ error: mocks.toast }),
}));

function makeWrapper(path = '/auth/login') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}>{children}</MemoryRouter></QueryClientProvider>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  onlineManager.setOnline(false);
});

afterEach(() => {
  cleanup();
  onlineManager.setOnline(true);
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Вход без соединения', () => {
  it('без сохранённой сессии открывает публичный экран', async () => {
    const { result } = renderHook(() => useRestoreSession(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(mocks.refreshToken).not.toHaveBeenCalled();
  });

  it('ошибка восстановления завершает ожидание и даёт повтор', async () => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ refreshToken: 'saved' }));
    mocks.refreshToken.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useRestoreSession(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isPending).toBe(false);
    mocks.refreshToken.mockResolvedValueOnce({ userPublicId: 'user', userName: 'Ученик', userRoles: [], refreshToken: 'new', jwtToken: 'token', exp: 0 });
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.user?.userPublicId).toBe('user'));
    expect(result.current.isPending).toBe(false);
  });

  it.each(['login', 'register'] as const)('%s показывает ошибку и снимает блокировку кнопки', async (mode) => {
    mocks[mode].mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useAuthForm(), { wrapper: makeWrapper(`/auth/${mode}`) });
    act(() => {
      result.current.setField('name', 'Ученик');
      result.current.setField('password', 'Пароль');
      result.current.setField('confirmPassword', 'Пароль');
    });
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as FormEvent));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.isLoading).toBe(false);
    expect(mocks[mode]).toHaveBeenCalledOnce();
  });
});
