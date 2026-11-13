import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const logoutToLogin = vi.hoisted(() => vi.fn());
vi.mock('@/Services/Auth/hooks/useLogout/useLogout', () => ({ logoutToLogin }));

afterEach(() => {
  cleanup();
  logoutToLogin.mockClear();
});

function FailedSection(): never {
  throw new Error('section import failed');
}

describe('Rendering recovery', () => {
  it('offers account exit when a section cannot render', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ErrorBoundary><FailedSection /></ErrorBoundary>);
    fireEvent.click(screen.getByTestId('error-boundary-login'));

    expect(screen.getByRole('button', { name: 'Обновить страницу' })).toBeTruthy();
    expect(logoutToLogin).toHaveBeenCalledOnce();
  });
});
