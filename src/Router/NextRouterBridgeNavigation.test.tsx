import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { Router } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import NextRouterBridge from './NextRouterBridge';

function Destination() {
  const location = useLocation();
  const navigate = useNavigate();
  return <>
    <output data-testid="location">{JSON.stringify(location)}</output>
    <button onClick={() => navigate('../schedule?event=one#details', { relative: 'path', state: { lessonId: 'lesson' } })}>schedule</button>
    <button onClick={() => navigate('/auth/register?returnTo=%2Fapp#form', { replace: true })}>register</button>
  </>;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('navigates between cached app routes through the real Next router without page-data requests', async () => {
  const initialPath = '/app/schools/school/today?view=day#now';
  const previousData = window.__NEXT_DATA__;
  const previousManifest = window.__BUILD_MANIFEST;
  const fetch = vi.fn(() => Promise.reject(new Error('Offline')));
  const loadPage = vi.fn(() => Promise.reject(new Error('Unexpected page load')));
  const getDataHref = vi.fn(() => { throw new Error('Unexpected page-data request'); });
  vi.stubGlobal('fetch', fetch);
  window.history.replaceState({}, '', initialPath);
  window.__NEXT_DATA__ = { props: {}, page: '/[[...path]]', query: {}, buildId: 'navigation-test', gssp: true };
  window.__BUILD_MANIFEST = { '/[[...path]]': [], '/_error': [] };
  const router = new Router('/[[...path]]', {}, initialPath, {
    App: () => null,
    Component: Destination,
    initialProps: { pageProps: { initialPath }, __N_SSP: true },
    pageLoader: { getMiddleware: () => [], getPageList: () => ['/[[...path]]', '/_error'], loadPage, getDataHref },
    wrapApp: App => App,
    subscription: async () => undefined,
    isFallback: false,
  });
  await router._initialMatchesMiddlewarePromise;
  const push = vi.spyOn(router, 'push');
  const replace = vi.spyOn(router, 'replace');
  try {
    const view = render(<RouterContext.Provider value={router}>
      <NextRouterBridge initialPath={initialPath}><Routes><Route path="*" element={<Destination />} /></Routes></NextRouterBridge>
    </RouterContext.Provider>);
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: 'schedule' }));
      await push.mock.results.at(-1)?.value;
    });
    expect(router.asPath).toBe('/app/schools/school/schedule?event=one#details');
    expect(view.getByTestId('location').textContent).toContain('"lessonId":"lesson"');
    expect(view.getByTestId('location').textContent).toContain('"hash":"#details"');
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: 'register' }));
      await replace.mock.results.at(-1)?.value;
    });
    expect(router.asPath).toBe('/auth/register?returnTo=%2Fapp#form');
    expect(view.getByTestId('location').textContent).toContain('"pathname":"/auth/register"');
    expect(view.getByTestId('location').textContent).toContain('"search":"?returnTo=%2Fapp"');
    expect(fetch).not.toHaveBeenCalled();
    expect(loadPage).not.toHaveBeenCalled();
    expect(getDataHref).not.toHaveBeenCalled();
  } finally {
    window.removeEventListener('popstate', router.onPopState);
    window.__NEXT_DATA__ = previousData;
    window.__BUILD_MANIFEST = previousManifest;
  }
});
