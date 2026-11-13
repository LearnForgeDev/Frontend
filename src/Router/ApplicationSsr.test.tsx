import type { ComponentProps } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { Box } from '@mui/material';
import { withEmotionCache, type EmotionCache } from '@emotion/react';
import type { AppType } from 'next/app';
import type { DocumentContext } from 'next/document';
import { Router } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { HtmlContext, type HtmlProps } from 'next/dist/shared/lib/html-context.shared-runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppRoutes from '@/AppRoutes';
import LearnForgeApp from '@/pages/_app';
import LearnForgeDocument from '@/pages/_document';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';

const readStorage = vi.fn(() => null);

beforeEach(() => {
  vi.stubGlobal('localStorage', { getItem: readStorage, setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal('sessionStorage', { getItem: readStorage, setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal('self', { __NEXT_DATA__: { gssp: true } });
});

afterEach(() => vi.unstubAllGlobals());

async function renderDocumentRequest(path: string, Component: ComponentProps<typeof LearnForgeApp>['Component'] = AppRoutes) {
  const router = new Router('/[[...path]]', {}, path, {
    App: () => null,
    Component,
    initialProps: { pageProps: { initialPath: path } },
    pageLoader: {},
    wrapApp: App => App,
    subscription: async () => undefined,
    isFallback: false,
  });
  const RequestApp: AppType = props => <LearnForgeApp {...props} router={router} />;
  const context: DocumentContext = {
    pathname: '/[[...path]]',
    query: {},
    asPath: path,
    AppTree: () => null,
    renderPage(options = {}) {
      const App = typeof options === 'function' ? RequestApp : options.enhanceApp?.(RequestApp) ?? RequestApp;
      const Page = typeof options === 'function' ? options(Component) : options.enhanceComponent?.(Component) ?? Component;
      return {
        html: renderToString(<RouterContext.Provider value={router}>
          <App Component={Page} pageProps={{ initialPath: path }} router={router} />
        </RouterContext.Provider>),
        head: [],
      };
    },
    defaultGetInitialProps: async current => current.renderPage(),
  };
  const props = await LearnForgeDocument.getInitialProps(context);
  const documentContext = {
    __NEXT_DATA__: { props: { pageProps: { initialPath: path } }, page: '/[[...path]]', query: {}, buildId: 'ssr-test', gssp: true },
    dangerousAsPath: path,
    docComponentsRendered: {},
    buildManifest: { devFiles: [], polyfillFiles: [], lowPriorityFiles: [], rootMainFiles: [], rootMainFilesTree: {}, pages: { '/_app': [], '/[[...path]]': [] } },
    isDevelopment: false,
    deploymentId: undefined,
    dynamicImports: [],
    dynamicCssManifest: new Set<string>(),
    headTags: [],
    assetQueryString: '',
    mutableAssetQueryString: '',
    cssAssetQueryString: '',
    scriptLoader: {},
    head: props.head,
    styles: [],
  } satisfies HtmlProps;
  const documentHtml = renderToStaticMarkup(<HtmlContext.Provider value={documentContext}>
    <LearnForgeDocument {...props} />
  </HtmlContext.Provider>);
  const css = renderToStaticMarkup(<>{props.emotionStyleTags}</>);
  return { html: props.html, documentHtml, css };
}

describe('Next application SSR', () => {
  it.each([
    ['/auth/login?returnTo=%2Fapp%3Fview%3Dday', 'С возвращением', 'auth-login-submit'],
    ['/auth/register', 'Регистрация', 'auth-register-submit'],
  ])('renders %s through the actual app, providers and document with server styles', async (path, heading, submit) => {
    const refresh = vi.spyOn(authEndpoints, 'refreshToken');
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const response = await renderDocumentRequest(path);
    expect(response.html).toContain(heading);
    expect(response.html).toContain('<form');
    expect(response.html).toContain(`data-testid="${submit}"`);
    expect(response.html).not.toContain('Проверяем вход');
    expect(response.css).toContain('--app-background:#f7f5ef');
    expect(response.css).toContain('data-emotion="mui');
    expect(response.documentHtml).toContain('<html lang="ru"');
    expect(response.documentHtml).toContain('name="emotion-insertion-point"');
    expect(response.documentHtml).toContain(response.css);
    expect(readStorage).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('creates a separate Emotion cache for each request and keeps request styles isolated', async () => {
    const caches: EmotionCache[] = [];
    const page = (color: string) => withEmotionCache<{ initialPath?: string }>((_props, cache) => {
      caches.push(cache);
      return <Box sx={{ color }}>Запрос</Box>;
    });
    const first = await renderDocumentRequest('/auth/login', page('rgb(1, 2, 3)'));
    const second = await renderDocumentRequest('/auth/login', page('rgb(4, 5, 6)'));
    expect(caches).toHaveLength(2);
    expect(caches[0]).not.toBe(caches[1]);
    expect(first.css).toContain('color:rgb(1, 2, 3)');
    expect(first.css).not.toContain('color:rgb(4, 5, 6)');
    expect(second.css).toContain('color:rgb(4, 5, 6)');
    expect(second.css).not.toContain('color:rgb(1, 2, 3)');
    expect(readStorage).not.toHaveBeenCalled();
  });

  it('renders the protected recovery gate through the app without reading browser identity', async () => {
    const response = await renderDocumentRequest('/app/schools');
    expect(response.html).toContain('Проверяем вход');
    expect(response.html).toContain('session-restore-login');
    expect(readStorage).not.toHaveBeenCalled();
  });
});
