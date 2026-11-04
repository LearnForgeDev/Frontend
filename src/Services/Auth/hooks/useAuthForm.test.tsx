import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFlowProvider } from '../contexts/AuthFlowContext';
import LoginPage from '../Pages/LoginPage/LoginPage';
import RegisterPage from '../Pages/RegisterPage/RegisterPage';
import { AUTH_VALIDATION_MESSAGES } from './useAuthForm/useAuthForm.const';
import type { AuthFormState, AuthMode } from './useAuthForm/useAuthForm.types';

const mocks = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), setUser: vi.fn(), toast: vi.fn() }));
vi.mock('@/Endpoints', () => ({ authEndpoints: mocks }));
vi.mock('@/Storage/UserContext/UserContext', () => ({ useUser: () => ({ setUser: mocks.setUser }) }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: mocks.toast }) }));

function renderForm(mode: AuthMode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { container } = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/auth/${mode}`]}>
        <Routes>
          <Route path="/auth/login" element={<AuthFlowProvider><LoginPage /></AuthFlowProvider>} />
          <Route path="/auth/register" element={<AuthFlowProvider><RegisterPage /></AuthFlowProvider>} />
          <Route path="/app" element={<h1>Готово</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  const form = container.querySelector('form');
  if (!form) throw new Error('Auth form is missing');
  return form;
}

function nativeInput(form: HTMLFormElement, name: keyof AuthFormState) {
  const input = form.elements.namedItem(name);
  if (!(input instanceof HTMLInputElement)) throw new Error(`Named auth input ${name} is missing`);
  return input;
}

function setNativeValues(form: HTMLFormElement, values: AuthFormState, mode: AuthMode) {
  nativeInput(form, 'name').value = values.name;
  nativeInput(form, 'password').value = values.password;
  if (mode === 'register') nativeInput(form, 'confirmPassword').value = values.confirmPassword;
}

function expectNativeValues(form: HTMLFormElement, values: AuthFormState, mode: AuthMode) {
  expect(nativeInput(form, 'name').value).toBe(values.name);
  expect(nativeInput(form, 'password').value).toBe(values.password);
  if (mode === 'register') expect(nativeInput(form, 'confirmPassword').value).toBe(values.confirmPassword);
}

beforeEach(() => vi.resetAllMocks());
afterEach(() => cleanup());

describe('Native auth form values', () => {
  it.each(['login', 'register'] as const)('submits %s values entered without React change events', async (mode) => {
    const values = { name: 'Автор', password: 'native-password', confirmPassword: mode === 'register' ? 'native-password' : '' };
    const form = renderForm(mode);
    expect(form.getAttribute('method')).toBe('post');
    const exp = Date.now() + 60_000;
    mocks[mode].mockResolvedValue({
      userPublicId: 'native-user', userName: values.name, userRoles: [], refreshToken: 'refresh',
      jwtToken: `header.${btoa(JSON.stringify({ exp: exp / 1000 }))}.signature`, exp,
    });
    setNativeValues(form, values, mode);

    fireEvent.submit(form);

    await waitFor(() => expect(mocks[mode]).toHaveBeenCalledWith(values));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Готово' })).toBeTruthy());
    expect(mocks.setUser).toHaveBeenCalledOnce();
  });

  it.each([
    { mode: 'login', values: { name: '', password: 'secret', confirmPassword: '' }, message: AUTH_VALIDATION_MESSAGES.name },
    { mode: 'login', values: { name: 'Автор', password: '', confirmPassword: '' }, message: AUTH_VALIDATION_MESSAGES.password },
    { mode: 'register', values: { name: 'Автор', password: 'secret', confirmPassword: '' }, message: AUTH_VALIDATION_MESSAGES.confirmation },
    { mode: 'register', values: { name: 'Автор', password: 'secret', confirmPassword: 'different' }, message: AUTH_VALIDATION_MESSAGES.mismatch },
  ] as const)('validates native $mode values and retains them after $message', ({ mode, values, message }) => {
    const form = renderForm(mode);
    setNativeValues(form, values, mode);

    fireEvent.submit(form);

    expect(screen.getByRole('alert').textContent).toContain(message);
    expectNativeValues(form, values, mode);
    expect(mocks[mode]).not.toHaveBeenCalled();
  });

  it.each(['login', 'register'] as const)('retains native %s values after a request failure and submits corrected values', async (mode) => {
    mocks[mode].mockRejectedValue(new Error('offline'));
    const values = { name: 'Автор', password: 'native-password', confirmPassword: mode === 'register' ? 'native-password' : '' };
    const form = renderForm(mode);
    setNativeValues(form, values, mode);

    fireEvent.submit(form);

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expectNativeValues(form, values, mode);
    expect(screen.getByTestId(`auth-${mode}-submit`).hasAttribute('disabled')).toBe(false);
    const corrected = { ...values, password: 'corrected-password', confirmPassword: mode === 'register' ? 'corrected-password' : '' };
    setNativeValues(form, corrected, mode);
    fireEvent.submit(form);

    await waitFor(() => expect(mocks[mode]).toHaveBeenNthCalledWith(2, corrected));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledTimes(2));
    expectNativeValues(form, corrected, mode);
  });
});
