import { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { createQueryFnWithRefresh } from '@/Endpoints/factory/factory';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { makeIdentity, requestError, response, storedIdentity } from '@/Services/Auth/sessionRefresh.testSupport';
import type { UserIdentity } from '@/Assets/Types/commonTypes';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

beforeEach(() => useGlobalContext.getState().auth.logout());
afterEach(() => {
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

it('rejects a late refresh from another account without overwriting the current login', async () => {
  useGlobalContext.getState().auth.setUser(makeIdentity('expired', Date.now() - 1));
  const refresh = deferred<UserIdentity>();
  const refreshToken = vi.spyOn(authEndpoints, 'refreshToken').mockReturnValue(refresh.promise);
  const client = createQueryFnWithRefresh();
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => response(config));
  client.defaults.adapter = adapter;
  const request = client.get('/private');
  const rejected = expect(request).rejects.toMatchObject({ status: 401 });
  await waitFor(() => expect(refreshToken).toHaveBeenCalledOnce());
  const next = { ...makeIdentity('next-account'), userPublicId: 'next-user' };
  useGlobalContext.getState().auth.setUser(next);
  refresh.resolve(makeIdentity('late-previous-account'));
  await rejected;
  expect(storedIdentity()).toMatchObject({ userPublicId: next.userPublicId, refreshToken: next.refreshToken });
  expect(adapter).not.toHaveBeenCalled();
});

it('accepts an identical sibling refresh while preserving the latest selected school', async () => {
  useGlobalContext.getState().auth.setUser(makeIdentity('expired', Date.now() - 1));
  const refresh = deferred<UserIdentity>();
  const refreshToken = vi.spyOn(authEndpoints, 'refreshToken').mockReturnValue(refresh.promise);
  const client = createQueryFnWithRefresh();
  client.defaults.adapter = async config => response(config);
  const request = client.get('/private');
  await waitFor(() => expect(refreshToken).toHaveBeenCalledOnce());
  const rotated = makeIdentity('sibling-rotation');
  useGlobalContext.getState().auth.setUser({ ...rotated, activeSchoolPublicId: 'latest-school' });
  refresh.resolve(rotated);
  await expect(request).resolves.toMatchObject({ status: 200 });
  expect(storedIdentity()).toMatchObject({ refreshToken: rotated.refreshToken, activeSchoolPublicId: 'latest-school' });
});

it('does not replay an old request after a different account receives its unauthorized response', async () => {
  useGlobalContext.getState().auth.setUser(makeIdentity('original-account'));
  const refreshToken = vi.spyOn(authEndpoints, 'refreshToken');
  const pending = deferred<AxiosResponse>();
  const adapter = vi.fn<(config: InternalAxiosRequestConfig) => Promise<AxiosResponse>>().mockReturnValue(pending.promise);
  const client = createQueryFnWithRefresh();
  client.defaults.adapter = adapter;
  const request = client.get('/private');
  const rejected = expect(request).rejects.toBeInstanceOf(AxiosError);
  await waitFor(() => expect(adapter).toHaveBeenCalledOnce());
  const next = { ...makeIdentity('next-account'), userPublicId: 'next-user' };
  useGlobalContext.getState().auth.setUser(next);
  pending.reject(requestError(adapter.mock.calls[0][0], 401));
  await rejected;
  expect(refreshToken).not.toHaveBeenCalled();
  expect(adapter).toHaveBeenCalledOnce();
  expect(storedIdentity().userPublicId).toBe(next.userPublicId);
});
