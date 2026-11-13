import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSchoolRequestPolling } from '@/Services/AdminPanel/hooks/useSchoolRequestPolling';
import { useJoinSchool as useAdminJoin } from '@/Services/AdminPanel/SchoolsPage/hooks/useJoinSchool';
import { useJoinSchool } from '@/Services/Onboarding/hooks/useJoinSchool';
import { useRequestSchool } from '@/Services/Onboarding/hooks/useRequestSchool';
import { useAcceptInvite } from '@/Services/Onboarding/hooks/useAcceptInvite';
import { isSchoolRequestUnavailable } from '@/Services/Onboarding/utils/schoolRequestError.utils';
import { readSchoolRequestPointer } from '@/Services/Onboarding/utils/schoolRequestStorage.utils';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { AxiosError } from 'axios';

const mocks = vi.hoisted(() => ({ joinSchool: vi.fn(), requestSchool: vi.fn(), getSchoolRequestStatus: vi.fn(), getMySchools: vi.fn(), setUser: vi.fn(), user: vi.fn(), error: vi.fn() }));
vi.mock('@/Endpoints/auth/auth.endpoints', () => ({ authEndpoints: mocks }));
vi.mock('@/Endpoints/schools/schools.endpoints', () => ({ schoolsEndpoints: mocks }));
vi.mock('@/Services/Auth/hooks/useUser', () => ({ useUser: () => mocks.user() }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: mocks.error }) }));

const identity = {
  userPublicId: 'user', userName: 'Пользователь', refreshToken: 'refresh', userRoles: [], exp: 0,
  jwtToken: `header.${btoa(JSON.stringify({ exp: 4_000_000_000 }))}.signature`,
};
const oldSchool = { schoolPublicId: 'old', schoolName: 'Старая школа', roles: [] };
const joinedSchool = { schoolPublicId: 'new', schoolName: 'Новая школа', roles: [] };
const clients = new Set<QueryClient>();

function context() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  clients.add(client);
  const wrapper = ({ children }: PropsWithChildren) => createElement(QueryClientProvider, { client }, createElement(MemoryRouter, { initialEntries: ['/onboarding'] }, children));
  return { client, wrapper };
}

function InvitationForm({ token }: { token: string }) {
  const action = useAcceptInvite(token, ['old']);
  return createElement('form', { onSubmit: action.submit }, createElement('button', { type: 'submit' }, 'Вступить'));
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.user.mockReturnValue({ user: identity, setUser: mocks.setUser });
  mocks.joinSchool.mockResolvedValue(identity);
  mocks.getMySchools.mockResolvedValue([oldSchool, joinedSchool]);
  useGlobalContext.getState().auth.setUser(identity);
});

afterEach(() => {
  cleanup();
  for (const client of clients) {
    client.clear();
  }
  clients.clear();
  vi.useRealTimers();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Joining and requesting schools', () => {
  it('installs a confirmed identity, refreshes memberships and enters only the newly discovered school', async () => {
    const setup = context();
    const invalidate = vi.spyOn(setup.client, 'invalidateQueries');
    const { result } = renderHook(() => ({ mutation: useJoinSchool(), location: useLocation() }), setup);
    await act(async () => {
      await result.current.mutation.mutateAsync({ inviteToken: 'invite', knownSchoolPublicIds: ['old'] });
    });
    expect(mocks.joinSchool).toHaveBeenCalledWith({ inviteToken: 'invite' });
    expect(mocks.setUser).toHaveBeenCalledWith(expect.objectContaining({ userPublicId: 'user' }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['my-schools'] });
    expect(result.current.location.pathname).toBe('/app/schools/new/today');
  });

  it('retains the authenticated result when membership refresh fails and sends the user to school selection', async () => {
    mocks.getMySchools.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => ({ mutation: useJoinSchool(), location: useLocation() }), context());
    await act(async () => {
      await result.current.mutation.mutateAsync({ inviteToken: 'invite', knownSchoolPublicIds: ['old'] });
    });
    expect(mocks.setUser).toHaveBeenCalledOnce();
    expect(result.current.location.pathname).toBe('/app/schools');
  });

  it('does not install malformed join credentials or guess among existing schools', async () => {
    mocks.joinSchool.mockResolvedValueOnce({ jwtToken: 'invalid' });
    const { result } = renderHook(() => ({ mutation: useJoinSchool(), location: useLocation() }), context());
    await act(async () => {
      await expect(result.current.mutation.mutateAsync({ inviteToken: 'invite', knownSchoolPublicIds: [] })).rejects.toThrow('Не удалось обновить сессию');
    });
    expect(mocks.setUser).not.toHaveBeenCalled();
    expect(mocks.getMySchools).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.mutation.mutateAsync({ inviteToken: 'invite', knownSchoolPublicIds: ['old', 'new'] });
    });
    expect(result.current.location.pathname).toBe('/app/schools');
  });

  it('preserves the legacy join hook identity update and query invalidation', async () => {
    const setup = context();
    const invalidate = vi.spyOn(setup.client, 'invalidateQueries');
    useGlobalContext.getState().auth.setUser({ ...identity, userPublicId: 'previous-user' });
    const { result } = renderHook(() => useAdminJoin(), setup);
    await act(async () => {
      await result.current.mutateAsync('invite');
    });
    expect(mocks.setUser).toHaveBeenCalledWith(identity);
    expect(useGlobalContext.getState().auth.user?.userPublicId).toBe('user');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['my-schools'] });
  });

  it('stores the request public ID and original membership baseline before opening the waiting page', async () => {
    mocks.requestSchool.mockResolvedValueOnce({ requestPublicId: 'request' });
    const { result } = renderHook(() => ({ mutation: useRequestSchool(), location: useLocation() }), context());
    await act(async () => {
      await result.current.mutation.mutateAsync('Моя школа');
    });
    expect(readSchoolRequestPointer('user')).toEqual({ userPublicId: 'user', requestPublicId: 'request', schoolName: 'Моя школа', knownSchoolPublicIds: ['old', 'new'] });
    expect(result.current.location.pathname).toBe('/onboarding/waiting/request');
    mocks.requestSchool.mockResolvedValueOnce({});
    await act(async () => {
      await expect(result.current.mutation.mutateAsync('Другая школа')).rejects.toThrow('School request public id is missing');
    });
    expect(readSchoolRequestPointer('user')?.requestPublicId).toBe('request');
  });

  it('blocks empty invitation submission and presents a failed invitation as recoverable', async () => {
    const setup = context();
    const view = render(createElement(InvitationForm, { token: '' }), { wrapper: setup.wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Вступить' }));
    expect(mocks.joinSchool).not.toHaveBeenCalled();
    mocks.joinSchool.mockRejectedValueOnce(new Error('expired'));
    view.rerender(createElement(InvitationForm, { token: 'expired' }));
    fireEvent.click(screen.getByRole('button', { name: 'Вступить' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Не удалось вступить. Ссылка могла истечь или исчерпать лимит.'));
    expect(screen.getByRole('button', { name: 'Вступить' })).toBeTruthy();
  });

  it.each([401, 403, 404])('classifies HTTP %i as an unavailable request without hiding transport errors', status => {
    const error = Object.assign(new AxiosError('unavailable'), { status });
    expect(isSchoolRequestUnavailable(error)).toBe(true);
    expect(isSchoolRequestUnavailable(new Error('offline'))).toBe(false);
    expect(isSchoolRequestUnavailable(Object.assign(new AxiosError('offline'), { status: 503 }))).toBe(false);
  });
});

describe('Legacy provisioning poll lifecycle', () => {
  it('clears a completed pointer, refreshes school data and stops its interval', async () => {
    vi.useFakeTimers();
    mocks.getSchoolRequestStatus.mockResolvedValue({ status: 'Completed' });
    const setup = context();
    const invalidate = vi.spyOn(setup.client, 'invalidateQueries');
    const { result, unmount } = renderHook(() => useSchoolRequestPolling(), setup);
    act(() => result.current.startPolling('request', 'Школа'));
    expect(result.current.hasActiveRequest).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(result.current.activeRequest).toBeNull();
    expect(localStorage.getItem('activeSchoolRequest')).toBeNull();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['my-schools'] });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(mocks.getSchoolRequestStatus).toHaveBeenCalledOnce();
    unmount();
  });

  it('keeps a pending pointer through transport failure and releases timers on unmount', async () => {
    vi.useFakeTimers();
    localStorage.setItem('activeSchoolRequest', JSON.stringify({ publicId: 'request', schoolName: 'Школа', status: 'Accepted' }));
    mocks.getSchoolRequestStatus.mockRejectedValue(new Error('offline'));
    const hook = renderHook(() => useSchoolRequestPolling(), context());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(hook.result.current.hasActiveRequest).toBe(true);
    expect(JSON.parse(localStorage.getItem('activeSchoolRequest') ?? '{}').publicId).toBe('request');
    hook.unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(mocks.getSchoolRequestStatus).toHaveBeenCalledOnce();
  });

  it('does not poll without a confirmed session and allows explicit dismissal', async () => {
    vi.useFakeTimers();
    mocks.user.mockReturnValue({ user: null, setUser: mocks.setUser });
    const { result } = renderHook(() => useSchoolRequestPolling(), context());
    act(() => result.current.startPolling('request', 'Школа'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(mocks.getSchoolRequestStatus).not.toHaveBeenCalled();
    act(() => result.current.clearRequest());
    expect(result.current.hasActiveRequest).toBe(false);
  });
});
