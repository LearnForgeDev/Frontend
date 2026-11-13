import { test, expect } from './fixtures';

const returnTo = '/onboarding?invite=ci-ssr-invitation#join';
const search = new URLSearchParams({ returnTo });

test.describe('Public server rendering without JavaScript', { tag: '@public' }, () => {
  test.use({ javaScriptEnabled: false });

  for (const mode of ['login', 'register']) {
    test(`SSR-01: ${mode} responds with a usable server-rendered form`, async ({ page, request }) => {
      const route = `/auth/${mode}?${search}`;
      const response = await request.get(route, {
        headers: {
          authorization: 'Bearer ci-ssr-private-token',
          cookie: 'refreshToken=ci-ssr-private-refresh; userName=ci-ssr-private-user',
        },
      });
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/html');
      const html = await response.text();
      expect(html).toMatch(/<form\b[^>]*method="post"/);
      expect(html).toMatch(/<input\b[^>]*type="password"/);
      expect(html).toMatch(/<input\b[^>]*name="name"/);
      expect(html).toContain(`data-testid="auth-${mode}-submit"`);
      for (const secret of ['ci-ssr-private-token', 'ci-ssr-private-refresh', 'ci-ssr-private-user']) {
        expect(html).not.toContain(secret);
      }
      await page.goto(route);
      const form = page.locator('form');
      await expect(form).toHaveAttribute('method', 'post');
      await expect(form.getByRole('heading', { name: mode === 'login' ? 'С возвращением' : 'Регистрация', exact: true })).toBeVisible();
      await expect(form.getByLabel(mode === 'login' ? /^Имя/ : /^Имя пользователя/)).toBeVisible();
      await expect(form.getByTestId(`auth-${mode}-submit`)).toBeEnabled();
      await expect(form.locator('input')).toHaveCount(mode === 'login' ? 2 : 3);
      const alternate = form.getByRole('link', { name: mode === 'login' ? 'Зарегистрироваться' : 'Войти', exact: true });
      const href = await alternate.getAttribute('href');
      expect(href).not.toBeNull();
      expect(new URL(href ?? '', page.url()).searchParams.get('returnTo')).toBe(returnTo);
    });
  }

  for (const route of ['/', '/auth']) {
    test(`SSR-02: ${route} redirects on the server and preserves the return query`, async ({ request }) => {
      const response = await request.get(`${route}?${search}`, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      const location = new URL(response.headers().location, response.url());
      expect(location.pathname).toBe('/auth/login');
      expect(location.searchParams.get('returnTo')).toBe(returnTo);
    });
  }

  for (const route of ['/missing-ssr-route', '/developer']) {
    test(`SSR-03: ${route} returns HTTP 404 and useful HTML without JavaScript`, async ({ page, request }) => {
      const response = await request.get(route);
      expect(response.status()).toBe(404);
      expect(await response.text()).toContain('Страница не найдена');
      const navigation = await page.goto(route);
      expect(navigation?.status()).toBe(404);
      await expect(page.getByText('Страница не найдена', { exact: true })).toBeVisible();
    });
  }
});

test('SSR-04: public hydration preserves return paths and working form controls', { tag: '@public' }, async ({ page }) => {
  await page.goto(`/auth/login?${search}`);
  await page.getByLabel(/^Пароль/).fill('ci-hydration-value');
  await page.getByTestId('auth-password-toggle').click();
  await expect(page.getByLabel(/^Пароль/)).toHaveAttribute('type', 'text');
  await expect(page.getByLabel(/^Пароль/)).toHaveValue('ci-hydration-value');
  await page.getByRole('link', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page.getByTestId('auth-register-submit')).toBeEnabled();
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(returnTo);
  await page.getByRole('link', { name: 'Войти', exact: true }).click();
  await expect(page.getByTestId('auth-login-submit')).toBeEnabled();
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(returnTo);
});
