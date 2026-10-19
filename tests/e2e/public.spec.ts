import { expect, test } from './fixtures';

test.describe('Публичные страницы', { tag: '@public' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('корень открывает форму входа', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByLabel(/^Имя/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
  });

  test('регистрация, несовпадающие пароли и переход ко входу', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL(/\/auth\/register$/);
    await page.getByLabel(/^Имя пользователя/i).fill('Ученик');
    await page.getByLabel(/^Пароль/i).fill('password-one');
    await page.getByLabel(/^Подтвердите пароль/i).fill('password-two');
    await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Пароли не совпадают');
    await page.getByRole('link', { name: 'Войти', exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('переключение видимости пароля сохраняет ввод', async ({ page }) => {
    await page.goto('/auth/login');
    const password = page.getByLabel(/^Пароль/i);
    await password.fill('secret');
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Показать пароль' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await expect(password).toHaveValue('secret');
    await page.getByRole('button', { name: 'Скрыть пароль' }).click();
    await expect(password).toHaveAttribute('type', 'password');
  });

  for (const route of ['/app', '/app/profile', '/admin', '/profile']) {
    test(`гость перенаправляется со страницы ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login$/);
      await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
    });
  }

  test('неизвестный маршрут показывает страницу 404', async ({ page }) => {
    await page.goto('/missing-route');
    await expect(page.getByText('Страница не найдена', { exact: true })).toBeVisible();
  });
});
