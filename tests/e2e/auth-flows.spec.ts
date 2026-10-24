import { test, expect } from './fixtures';
import { BACKEND_TIMEOUT_MS, CI_PASSWORD, SCHOOL_PATH } from './core.const';
import { ERROR_RESPONSE } from './flows.const';

test('AUTH-03: вход через Enter открывает рабочую школу', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel(/^Имя/).fill('ci-owner');
  await page.getByLabel(/^Пароль/).fill(CI_PASSWORD);
  await page.getByLabel(/^Пароль/).press('Enter');
  await expect(page).toHaveURL(`${SCHOOL_PATH}/today`, { timeout: BACKEND_TIMEOUT_MS });
});

test('AUTH-08: занятое имя не создаёт новую сессию', async ({ page }) => {
  await page.goto('/auth/register');
  await page.getByLabel(/^Имя пользователя/).fill('ci-owner');
  await page.getByLabel(/^Пароль/).fill(CI_PASSWORD);
  await page.getByLabel(/^Подтвердите пароль/).fill(CI_PASSWORD);
  await page.getByTestId('auth-register-submit').click();
  await expect(page.getByRole('alert').first()).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/register$/);
  expect(await page.evaluate(() => localStorage.getItem('user_identity'))).toBeNull();
});

for (const route of ['/auth/login', '/auth/register']) {
  test(`AUTH-09: авторизованный пользователь не остаётся на ${route}`, async ({ actors }) => {
    const { page } = await actors();
    await page.goto(route);
    await expect(page).toHaveURL(`${SCHOOL_PATH}/today`);
  });
}

test('SESSION-01 SESSION-07: сессия переносится в новый контекст и очищается при выходе', async ({ actors, browser }) => {
  const actor = await actors();
  await actor.page.goto(`${SCHOOL_PATH}/lessons`);
  await expect(actor.page.getByRole('heading', { name: 'Мои уроки', exact: true })).toBeVisible();
  const restored = await browser.newContext({ storageState: await actor.context.storageState() });
  try {
    const page = await restored.newPage();
    await page.goto(new URL(`${SCHOOL_PATH}/lessons`, actor.page.url()).href);
    await expect(page.getByRole('heading', { name: 'Мои уроки', exact: true })).toBeVisible();
    await page.getByTestId('profile-open').click();
    await expect(page.getByTestId('profile-logout')).toBeVisible();
    await page.getByTestId('profile-logout').click();
    await page.reload();
    await expect(page).toHaveURL(/\/auth\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('user_identity'))).toBeNull();
    await page.goBack();
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();
  } finally {
    await restored.close();
  }
});

test('SESSION-06: ошибка восстановления блокирует доступ до успешного повтора', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.route('**/api/ApiAuth/refreshToken', route => route.fulfill(ERROR_RESPONSE));
  await page.goto(`${SCHOOL_PATH}/lessons`);
  await expect(page.getByRole('button', { name: 'Повторить', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Разделы школы' })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('user_identity'))).not.toBeNull();
  await page.unroute('**/api/ApiAuth/refreshToken');
  await page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Мои уроки', exact: true })).toBeVisible();
});
