import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import ProtectedRoute from '@/Router/ProtectedRoute';
import { UserProvider } from '@/Storage/UserContext/UserContext';
import { USER_STORAGE_KEY } from '@/Storage/UserContext/UserContext.const';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import AuthLayout from '../Pages/AuthLayout/AuthLayout';
import { useLogout } from './useLogout/useLogout';
import { useRestoreSession } from './useRestoreSession/useRestoreSession';

const mocks = vi.hoisted(() => ({ refreshToken: vi.fn() }));
vi.mock('@/Endpoints/auth/auth.endpoints', () => ({ authEndpoints: mocks }));

function makeIdentity(): UserIdentity {
  const exp = Date.now() + 60_000;
  return {
    userPublicId: 'recovery-user', userName: 'Пользователь',
    userRoles: [{ role: 1, schoolId: '11111111-1111-4111-8111-111111111111', userId: 2 }],
    jwtToken: `header.${btoa(JSON.stringify({ exp: exp / 1000 }))}.signature`,
    refreshToken: 'refreshed-token', exp,
  };
}

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function renderRoute(path: string) {
  const Wrapper = makeWrapper();
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={[path]}>
        <UserProvider>
          <Routes>
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<h1>Вход в аккаунт</h1>} />
            </Route>
            <Route path="/app" element={<h1>Кешированные школы</h1>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/private" element={<><h1>Данные аккаунта</h1><Link to="/auth/login">Открыть вход</Link></>} />
            </Route>
          </Routes>
        </UserProvider>
      </MemoryRouter>
    </Wrapper>,
  );
}

beforeEach(() => {
  mocks.refreshToken.mockReset();
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ refreshToken: 'saved-token' }));
});

afterEach(() => {
  cleanup();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
  vi.unstubAllGlobals();
  onlineManager.setOnline(true);
});

describe('Session recovery', () => {
  it('restores a confirmed identity with a nonempty public-school role list', async () => {
    const identity = makeIdentity();
    mocks.refreshToken.mockResolvedValue(identity);

    renderRoute('/private');

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Данные аккаунта' })).toBeTruthy());
    expect(useGlobalContext.getState().auth.user?.roles).toEqual(identity.userRoles);
    expect(JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!).userRoles).toEqual(identity.userRoles);
    expect(mocks.refreshToken).toHaveBeenCalledOnce();
  });

  it('opens explicit login after a confirmed JWT expires without another API request', async () => {
    const identity = makeIdentity();
    useGlobalContext.getState().auth.setUser({ ...identity, exp: identity.exp + 60_000 });
    renderRoute('/private');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Данные аккаунта' })).toBeTruthy());
    onlineManager.setOnline(false);
    vi.spyOn(Date, 'now').mockReturnValue(identity.exp + 1);

    fireEvent.click(screen.getByRole('link', { name: 'Открыть вход' }));

    expect(mocks.refreshToken).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Вход в аккаунт' })).toBeTruthy();
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(true);
    expect(localStorage.getItem(USER_STORAGE_KEY)).not.toBeNull();
  });

  it('keeps the redirect for a current session without requesting the backend', async () => {
    useGlobalContext.getState().auth.setUser({ ...makeIdentity(), exp: 0 });
    renderRoute('/private');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Данные аккаунта' })).toBeTruthy());

    fireEvent.click(screen.getByRole('link', { name: 'Открыть вход' }));

    expect(screen.getByRole('heading', { name: 'Кешированные школы' })).toBeTruthy();
    expect(mocks.refreshToken).not.toHaveBeenCalled();
  });

  it('uses rotated credentials even when the restore query still holds the previous token', async () => {
    const identity = makeIdentity();
    useGlobalContext.getState().auth.setUser(identity);
    renderRoute('/private');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Данные аккаунта' })).toBeTruthy());
    vi.spyOn(Date, 'now').mockReturnValue(identity.exp + 1);
    act(() => useGlobalContext.getState().auth.setUser(makeIdentity()));

    fireEvent.click(screen.getByRole('link', { name: 'Открыть вход' }));

    expect(screen.getByRole('heading', { name: 'Кешированные школы' })).toBeTruthy();
    expect(mocks.refreshToken).not.toHaveBeenCalled();
  });

  it('renders public HTML without restoring credentials on the server', () => {
    const Wrapper = makeWrapper();

    const html = renderToString(<Wrapper><UserProvider><h1>Вход в аккаунт</h1></UserProvider></Wrapper>);

    expect(html).toContain('Вход в аккаунт');
    expect(mocks.refreshToken).not.toHaveBeenCalled();
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
  });

  it.each(['pending', 'failed'])('keeps login reachable while restore is %s', async (state) => {
    if (state === 'pending') {
      mocks.refreshToken.mockImplementation(() => new Promise(() => {}));
    }
    else {
      mocks.refreshToken.mockRejectedValue(new Error('offline'));
    }

    renderRoute('/auth/login');

    expect(screen.getByRole('heading', { name: 'Вход в аккаунт' })).toBeTruthy();
    await waitFor(() => expect(mocks.refreshToken).toHaveBeenCalledOnce());
    expect(screen.queryByRole('heading', { name: 'Данные аккаунта' })).toBeNull();
  });

  it('offers an immediate escape from a slow protected restore', async () => {
    mocks.refreshToken.mockImplementation(() => new Promise(() => {}));

    renderRoute('/private');

    expect(screen.getByTestId('session-restore-login')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Данные аккаунта' })).toBeNull();
  });

  it('retries a failed restore without treating that failure as authentication', async () => {
    mocks.refreshToken.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(makeIdentity());
    renderRoute('/private');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Повторить' })).toBeTruthy());
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(screen.getByTestId('session-restore-login')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Данные аккаунта' })).toBeTruthy());
    expect(mocks.refreshToken).toHaveBeenCalledTimes(2);
  });

  it('discards a pending restore and does not accept its late identity', async () => {
    let finish!: (identity: UserIdentity) => void;
    mocks.refreshToken.mockImplementation(() => new Promise<UserIdentity>((resolve) => {
      finish = resolve;
    }));
    const { result } = renderHook(() => useRestoreSession(), { wrapper: makeWrapper() });
    await waitFor(() => expect(mocks.refreshToken).toHaveBeenCalledOnce());

    act(() => result.current.clearUser());
    await act(async () => {
      finish(makeIdentity());
    });

    expect(result.current.user).toBeNull();
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
  });

  it('clears session before a full-page login navigation and retains account-scoped drafts', async () => {
    mocks.refreshToken.mockImplementation(() => new Promise(() => {}));
    localStorage.setItem('lesson-draft:recovery-user:school:lesson', 'unsaved');
    const Wrapper = makeWrapper();
    const { result } = renderHook(() => useLogout(), {
      wrapper: ({ children }) => <Wrapper><UserProvider>{children}</UserProvider></Wrapper>,
    });
    const assign = vi.fn(() => expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull());
    const browserWindow = window;
    vi.stubGlobal('window', { location: { assign } });

    act(() => result.current());
    vi.stubGlobal('window', browserWindow);

    expect(assign).toHaveBeenCalledWith('/auth/login');
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem('lesson-draft:recovery-user:school:lesson')).toBe('unsaved');
  });
});
