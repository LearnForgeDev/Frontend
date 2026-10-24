import { expect, test } from './fixtures';

test.describe('Публичные страницы', { tag: '@public' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  for (const route of ['/', '/auth']) {
  test(`AUTH-01: ${route} открывает форму входа`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByLabel(/^Имя/i)).toBeVisible();
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();
  });
  }

  test('AUTH-02 AUTH-08: регистрация, несовпадающие пароли и переход ко входу', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL(/\/auth\/register$/);
    await page.getByLabel(/^Имя пользователя/i).fill('Ученик');
    await page.getByLabel(/^Пароль/i).fill('password-one');
    await page.getByLabel(/^Подтвердите пароль/i).fill('password-two');
    await page.getByTestId('auth-register-submit').click();
    await expect(page.getByRole('alert')).toContainText('Пароли не совпадают');
    await page.getByRole('link', { name: 'Войти', exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('AUTH-06: переключение видимости пароля сохраняет ввод', async ({ page }) => {
    await page.goto('/auth/login');
    const password = page.getByLabel(/^Пароль/i);
    await password.fill('secret');
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByTestId('auth-password-toggle').click();
    await expect(password).toHaveAttribute('type', 'text');
    await expect(password).toHaveValue('secret');
    await page.getByTestId('auth-password-toggle').click();
    await expect(password).toHaveAttribute('type', 'password');
  });

  for (const route of ['/app', '/app/profile', '/admin', '/profile', '/onboarding', '/onboarding/waiting/request', '/Lessons', '/Lessons/1', '/app/schools', ...['today', 'lessons', 'lessons/1?edit=true', 'courses', 'courses/course', 'courses/course/lessons/1', 'schedule', 'calls', 'files', 'chats', 'students'].map(path => `/app/schools/school/${path}`)]) {
    test(`SESSION-02: гость перенаправляется со страницы ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(url => url.pathname === '/auth/login');
      expect(new URL(page.url()).searchParams.get('returnTo')).toBe(route === '/app' ? null : route);
      await expect(page.getByTestId('auth-login-submit')).toBeVisible();
    });
  }

  test('NAV-08: неизвестный маршрут показывает страницу 404', async ({ page }) => {
    await page.goto('/missing-route');
    await expect(page.getByText('Страница не найдена', { exact: true })).toBeVisible();
  });

  for (const route of ['/auth/login', '/auth/register']) {
    test(`AUTH-05: обязательные поля блокируют отправку ${route}`, async ({ page }) => {
      await page.goto(route);
      const form = page.locator('form');
      await expect(form.locator('input:invalid').first()).toBeVisible();
      await form.getByRole('button', { name: route.endsWith('login') ? 'Войти' : 'Зарегистрироваться', exact: true }).click();
      expect(await form.evaluate(element => (element as HTMLFormElement).checkValidity())).toBe(false);
      await expect(page).toHaveURL(new RegExp(`${route}$`));
    });
  }

  test('NAV-08: со страницы запрета можно вернуться ко входу', async ({ page }) => {
    await page.goto('/403');
    await expect(page.getByRole('heading', { name: 'Доступ ограничен' })).toBeVisible();
    await page.getByRole('button', { name: 'На главную' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
