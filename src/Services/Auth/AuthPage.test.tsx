import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFlowProvider } from './contexts/AuthFlowContext';
import LoginPage from './Pages/LoginPage/LoginPage';
import RegisterPage from './Pages/RegisterPage/RegisterPage';
import { AUTH_VALIDATION_MESSAGES } from './hooks/useAuthForm/useAuthForm.const';

const mocks = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), setUser: vi.fn(), toast: vi.fn(), store: vi.fn() }));
vi.mock('@/Endpoints', () => ({ authEndpoints: mocks }));
vi.mock('@/Storage/UserContext/UserContext', () => ({ useUser: () => ({ setUser: mocks.setUser }) }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: mocks.toast }) }));

const identity = {
  userPublicId: 'student', userName: 'Ученик', refreshToken: 'refresh', userRoles: [],
  jwtToken: `header.${btoa(JSON.stringify({ exp: 4_000_000_000 }))}.signature`,
};

function renderAuth(path = '/auth/login') {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}>
    <AuthFlowProvider>{path === '/auth/register' ? <RegisterPage /> : <LoginPage />}</AuthFlowProvider>
  </MemoryRouter></QueryClientProvider>);
  fireEvent.change(screen.getByLabelText(/^Имя/), { target: { value: 'Ученик' } });
  fireEvent.change(screen.getByLabelText(/^Пароль/), { target: { value: 'old' } });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('PasswordCredential', vi.fn(function (data: { id: string; password: string }) {
    return { ...data, type: 'password' };
  }));
  mocks.store.mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { ...navigator, credentials: { store: mocks.store } });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Login submission and password saving', () => {
  it('keeps autofill hints and does not dispatch native submission on click or Enter', async () => {
    mocks.login.mockRejectedValue(new Error('Неверный пароль'));
    renderAuth();
    const name = screen.getByLabelText(/^Имя/);
    const password = screen.getByLabelText(/^Пароль/);
    if (!(name instanceof HTMLInputElement) || !(password instanceof HTMLInputElement)) {
      throw new Error('Named auth inputs are missing');
    }
    expect(name.getAttribute('name')).toBe('name');
    expect(name.getAttribute('autocomplete')).toBe('username');
    name.value = 'Автозаполнение';
    password.value = 'autofill-password';
    expect(password.getAttribute('autocomplete')).toBe('current-password');
    const submit = vi.fn();
    const form = password.closest('form');
    form?.addEventListener('submit', submit);
    const button = screen.getByRole('button', { name: 'Войти' });
    expect(button.getAttribute('type')).toBe('button');
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^Пароль/)).toBe(password);
    expect(password).toHaveProperty('value', 'autofill-password');
    expect(mocks.login).toHaveBeenNthCalledWith(1, { name: 'Автозаполнение', password: 'autofill-password', confirmPassword: '' });
    expect(mocks.store).not.toHaveBeenCalled();
    name.value = 'До обработки изменений';
    password.value = 'before-hydration';
    expect(fireEvent.keyDown(password, { key: 'Enter' })).toBe(false);
    await waitFor(() => expect(mocks.login).toHaveBeenNthCalledWith(2, { name: 'До обработки изменений', password: 'before-hydration', confirmPassword: '' }));
    expect(submit).not.toHaveBeenCalled();
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it('saves only after a valid server response and does not duplicate pending attempts', async () => {
    let complete: (value: typeof identity) => void = () => { throw new Error('Login has not started'); };
    mocks.login.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
    renderAuth();
    const password = screen.getByLabelText(/^Пароль/);
    fireEvent.keyDown(password, { key: 'Enter' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Вход...' })).toHaveProperty('disabled', true));
    fireEvent.keyDown(password, { key: 'Enter' });
    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.store).not.toHaveBeenCalled();
    await act(async () => complete(identity));
    await waitFor(() => expect(mocks.store).toHaveBeenCalledOnce());
    expect(mocks.store).toHaveBeenCalledWith({ id: 'Ученик', password: 'old', type: 'password' });
    expect(mocks.setUser).toHaveBeenCalledOnce();
  });

  it('rejects missing input and malformed successful responses without saving', async () => {
    mocks.login.mockResolvedValue({});
    renderAuth();
    const password = screen.getByLabelText(/^Пароль/);
    fireEvent.change(password, { target: { value: '' } });
    fireEvent.keyDown(password, { key: 'Enter' });
    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.store).not.toHaveBeenCalled();
    fireEvent.change(password, { target: { value: 'old' } });
    fireEvent.keyDown(password, { key: 'a' });
    fireEvent.keyDown(password, { key: 'Enter', isComposing: true });
    expect(mocks.login).not.toHaveBeenCalled();
    fireEvent.keyDown(password, { key: 'Enter' });
    await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
    expect(mocks.setUser).not.toHaveBeenCalled();
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it('explains registration requirements, blocks weak passwords and saves a confirmed new account', async () => {
    mocks.register.mockResolvedValue(identity);
    renderAuth('/auth/register');
    expect(screen.getByText(AUTH_VALIDATION_MESSAGES.passwordRequirements)).toBeTruthy();
    const password = screen.getByLabelText(/^Пароль/);
    const confirmation = screen.getByLabelText(/^Подтвердите пароль/);
    expect(password.getAttribute('autocomplete')).toBe('new-password');
    expect(confirmation.getAttribute('autocomplete')).toBe('new-password');
    fireEvent.change(confirmation, { target: { value: 'old' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));
    expect(mocks.register).not.toHaveBeenCalled();
    expect(mocks.store).not.toHaveBeenCalled();
    fireEvent.change(password, { target: { value: 'ДлинныйПароль1' } });
    fireEvent.change(confirmation, { target: { value: 'ДлинныйПароль1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));
    await waitFor(() => expect(mocks.store).toHaveBeenCalledOnce());
    expect(mocks.register).toHaveBeenCalledWith({ name: 'Ученик', password: 'ДлинныйПароль1', confirmPassword: 'ДлинныйПароль1' });
    expect(mocks.store).toHaveBeenCalledWith({ id: 'Ученик', password: 'ДлинныйПароль1', type: 'password' });
  });
});
