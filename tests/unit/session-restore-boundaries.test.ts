import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { useRestoreSession } from '@/Services/Auth/hooks/useRestoreSession/useRestoreSession';
import { makeIdentity } from '@/Services/Auth/sessionRefresh.testSupport';
import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import type { UserIdentity } from '@/Assets/Types/commonTypes';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/Storage/useToastStore', () => ({
  ToastSeverity: { ERROR: 2 },
  useToastStore: { getState: () => ({ addToast: toast }) },
}));

let client: QueryClient;
function wrapper({ children }: PropsWithChildren) {
  return createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => {
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

it.each(['null', '{}', '{broken'])('rejects invalid persisted credentials without attempting a refresh: %s', async stored => {
  localStorage.setItem(USER_STORAGE_KEY, stored);
  const refreshToken = vi.spyOn(authEndpoints, 'refreshToken');
  const { result } = renderHook(useRestoreSession, { wrapper });
  await waitFor(() => expect(result.current.isPending).toBe(false));
  expect(result.current.user).toBeNull();
  expect(result.current.isError).toBe(false);
  expect(refreshToken).not.toHaveBeenCalled();
  expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
});

it('clears a malformed refresh response instead of confirming an unusable session', async () => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ refreshToken: 'saved-token' }));
  vi.spyOn(authEndpoints, 'refreshToken').mockResolvedValue({ ...makeIdentity(), jwtToken: '' });
  const { result } = renderHook(useRestoreSession, { wrapper });
  await waitFor(() => expect(result.current.isPending).toBe(false));
  expect(result.current.user).toBeNull();
  expect(result.current.isError).toBe(false);
  expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  expect(toast).not.toHaveBeenCalled();
});

it('ignores a late restore failure after a successful interactive login', async () => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ refreshToken: 'saved-token' }));
  let fail!: (error: unknown) => void;
  const response = new Promise<UserIdentity>((_resolve, reject) => {
    fail = reject;
  });
  const refreshToken = vi.spyOn(authEndpoints, 'refreshToken').mockReturnValue(response);
  const { result } = renderHook(useRestoreSession, { wrapper });
  await waitFor(() => expect(refreshToken).toHaveBeenCalledOnce());
  const identity = makeIdentity('interactive-login');
  act(() => result.current.setUser(identity));
  await act(async () => {
    fail(new Error('The earlier restore request failed.'));
    await response.catch(() => undefined);
  });
  await waitFor(() => expect(result.current.isPending).toBe(false));
  expect(result.current.user?.refreshToken).toBe(identity.refreshToken);
  expect(result.current.isError).toBe(false);
  expect(useGlobalContext.getState().auth.user?.userPublicId).toBe(identity.userPublicId);
  expect(toast).not.toHaveBeenCalled();
});
