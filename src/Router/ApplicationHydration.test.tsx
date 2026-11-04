import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Router } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { afterEach, expect, it, vi } from 'vitest';
import LearnForgeApp from '@/pages/_app';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  useGlobalNotificationStore.setState({ notifications: [] });
});

it('restores saved notifications only when the actual Next app mounts in the browser', async () => {
  const saved = { id: 'saved', title: 'Сохранённое уведомление' };
  const readStorage = vi.fn((key: string) => key === 'high_priority_notifications' ? JSON.stringify([saved]) : null);
  vi.stubGlobal('localStorage', { getItem: readStorage, setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal('sessionStorage', { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  window.__NEXT_DATA__ = { props: {}, page: '/[[...path]]', query: {}, buildId: 'hydration-test', gssp: true };
  const Page = () => <output>{useGlobalNotificationStore(state => state.notifications).map(notification => notification.title).join(',')}</output>;
  const router = new Router('/[[...path]]', {}, '/auth/login', {
    App: () => null,
    Component: Page,
    initialProps: { pageProps: { initialPath: '/auth/login' } },
    pageLoader: { getMiddleware: () => [] },
    wrapApp: App => App,
    subscription: async () => undefined,
    isFallback: false,
  });
  await router._initialMatchesMiddlewarePromise;
  const application = <RouterContext.Provider value={router}>
    <LearnForgeApp Component={Page} pageProps={{ initialPath: '/auth/login' }} router={router} />
  </RouterContext.Provider>;
  expect(renderToString(application)).not.toContain(saved.title);
  expect(readStorage).not.toHaveBeenCalled();
  try {
    const view = render(application);
    expect(await view.findByText(saved.title)).toBeTruthy();
    expect(readStorage).toHaveBeenCalledWith('high_priority_notifications');
  } finally {
    window.removeEventListener('popstate', router.onPopState);
  }
});
