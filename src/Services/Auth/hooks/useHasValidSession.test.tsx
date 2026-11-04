import { act, cleanup, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useHasValidSession } from './useHasValidSession';

function identity(expiresAt: number): UserIdentity {
  return {
    userPublicId: 'current-user', userName: 'Пользователь', userRoles: [], refreshToken: 'refresh',
    jwtToken: `header.${btoa(JSON.stringify({ exp: expiresAt / 1000 }))}.signature`, exp: expiresAt,
  };
}

afterEach(() => {
  cleanup();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

function SessionValidity() {
  return <span>{useHasValidSession() ? 'current' : 'expired'}</span>;
}

describe('Current session redirect eligibility', () => {
  it('uses decoded expiry and treats equality as expired', () => {
    const expiresAt = Date.now() + 60_000;
    useGlobalContext.getState().auth.setUser({ ...identity(expiresAt), exp: 0 });
    const { result, rerender } = renderHook(() => useHasValidSession());
    expect(result.current).toBe(true);
    expect(useGlobalContext.getState().auth.jwtExpiresAt).toBe(expiresAt);

    vi.spyOn(Date, 'now').mockReturnValue(expiresAt);
    rerender();

    expect(result.current).toBe(false);
  });

  it('does not accept malformed JWT credentials with a future persisted expiry', () => {
    useGlobalContext.getState().auth.setUser({ ...identity(Date.now() + 60_000), jwtToken: 'invalid' });

    const { result } = renderHook(() => useHasValidSession());

    expect(result.current).toBe(false);
    expect(useGlobalContext.getState().auth.jwtExpiresAt).toBeNull();
  });

  it('updates current expiry on rotation and clears it on logout', () => {
    useGlobalContext.getState().auth.setUser(identity(Date.now() - 1));
    const { result } = renderHook(() => useHasValidSession());
    expect(result.current).toBe(false);

    act(() => useGlobalContext.getState().auth.setUser(identity(Date.now() + 60_000)));
    expect(result.current).toBe(true);
    act(() => useGlobalContext.getState().auth.logout());

    expect(result.current).toBe(false);
    expect(useGlobalContext.getState().auth.jwtExpiresAt).toBeNull();
  });

  it('renders the signed-out server snapshot without reading browser storage', () => {
    useGlobalContext.getState().auth.setUser(identity(Date.now() + 60_000));
    const readStorage = vi.spyOn(Object.getPrototypeOf(localStorage), 'getItem').mockImplementation(() => {
      throw new Error('storage must not be read during rendering');
    });

    expect(renderToString(<SessionValidity />)).toContain('expired');
    expect(readStorage).not.toHaveBeenCalled();
  });
});
