import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';
import { useRestoreSession } from './useRestoreSession/useRestoreSession';
import { AuthFlowProvider } from '../contexts/AuthFlowContext';
import LoginPage from '../Pages/LoginPage/LoginPage';
import RegisterPage from '../Pages/RegisterPage/RegisterPage';

const mocks = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), refreshToken: vi.fn(), toast: vi.fn() }));
vi.mock('@/Endpoints', () => ({ authEndpoints: mocks }));
vi.mock('@/Endpoints/auth/auth.endpoints', () => ({ authEndpoints: mocks }));
vi.mock('@/Endpoints/auth/utils', (importOriginal) => importOriginal<typeof import('@/Endpoints/auth/utils')>().then((original) => Object.assign({}, original, {
  normalizeRestoredSession: (value: unknown) => value,
})));
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
    const Page = mode === 'login' ? LoginPage : RegisterPage;
    render(<AuthFlowProvider><Page /></AuthFlowProvider>, { wrapper: makeWrapper(`/auth/${mode}`) });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Ученик' } });
    fireEvent.change(screen.getByLabelText(/^Пароль/), { target: { value: 'Пароль' } });
    if (mode === 'register') fireEvent.change(screen.getByLabelText(/^Подтвердите пароль/), { target: { value: 'Пароль' } });
    const submit = screen.getByTestId(`auth-${mode}-submit`);
    fireEvent.click(submit);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(submit.hasAttribute('disabled')).toBe(false);
    expect(mocks[mode]).toHaveBeenCalledOnce();
  });
});
