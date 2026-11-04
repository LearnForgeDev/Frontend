import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, StaticRouter, useLocation } from 'react-router-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { theme } from '@/Assets/theme';
import AppRoutes from '@/AppRoutes';
import QuerySession from '@/Storage/QueryContext/QuerySession';
import { UserProvider } from '@/Storage/UserContext/UserContext';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { getServerSideProps } from '@/pages/[[...path]]';
import ServerErrorPage from '@/pages/_error';

function renderRequest(path: string) {
  return renderToString(<ThemeProvider theme={theme}>
    <StaticRouter location={path}>
      <QuerySession><UserProvider><AppRoutes /></UserProvider></QuerySession>
    </StaticRouter>
  </ThemeProvider>);
}

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-auth-path">{location.pathname}{location.search}{location.hash}</output>;
}

describe('server route rendering', () => {
  afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });

  it.each([
    ['/auth/login', 'С возвращением', 'auth-login-submit'],
    ['/auth/register', 'Регистрация', 'auth-register-submit'],
  ])('renders the complete public form for %s without restoring browser credentials', (path, heading, submit) => {
    const readStorage = vi.spyOn(Storage.prototype, 'getItem');
    const refresh = vi.spyOn(authEndpoints, 'refreshToken');
    const html = renderRequest(path);
    expect(html).toContain(heading);
    expect(html).toContain('<form');
    expect(html).toContain('type="password"');
    expect(html).toContain(`data-testid="${submit}"`);
    expect(html).not.toContain('Загрузка раздела');
    expect(readStorage).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it.each(['/', '/auth'])('preserves query and fragment on a cached client auth alias %s', async path => {
    render(<ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[`${path}?returnTo=%2Fapp%2Fschools#details`]}>
        <QuerySession><UserProvider><AppRoutes /><CurrentPath /></UserProvider></QuerySession>
      </MemoryRouter>
    </ThemeProvider>);
    await waitFor(() => expect(screen.getByTestId('current-auth-path').textContent).toBe('/auth/login?returnTo=%2Fapp%2Fschools#details'));
    expect(screen.getByTestId('auth-login-submit')).toBeTruthy();
  });

  it('keeps a protected route behind the restoration gate', () => {
    const html = renderRequest('/app/schools');
    expect(html).toContain('Проверяем вход');
    expect(html).toContain('session-restore-login');
    expect(html).not.toContain('school-switcher');
  });

  it('renders a Russian retry page when Next handles a server error', () => {
    const html = renderToString(<ServerErrorPage />);
    expect(html).toContain('Не удалось открыть страницу');
    expect(html).toContain('Обновить страницу');
  });

  it.each([
    ['/403', 'Доступ ограничен'],
    ['/unknown-address', 'Страница не найдена'],
  ])('renders a public error page for %s', (path, heading) => {
    expect(renderRequest(path)).toContain(heading);
  });

  it.each(['/', '/auth', '/AUTH'])('redirects %s on the server while preserving the auth return query', async (path) => {
    const req = Object.assign(new IncomingMessage(new Socket()), { cookies: {} });
    const res = new ServerResponse(req);
    const result = await getServerSideProps({ req, res, query: {}, resolvedUrl: `${path}?returnTo=%2Fapp` });
    expect(result).toEqual({ redirect: { destination: '/auth/login?returnTo=%2Fapp', permanent: false } });
    expect(res.getHeader('Cache-Control')).toBe('private, no-store');
  });

  it.each([
    ['/unknown-address', 404],
    ['/app/schools', 200],
    ['/auth/login?returnTo=%2Fapp', 200],
  ])('sets HTTP status for %s from the real route tree', async (resolvedUrl, status) => {
    const req = Object.assign(new IncomingMessage(new Socket()), { cookies: {} });
    const res = new ServerResponse(req);
    expect(await getServerSideProps({ req, res, query: {}, resolvedUrl })).toEqual({ props: { initialPath: resolvedUrl } });
    expect(res.statusCode).toBe(status);
  });
});
