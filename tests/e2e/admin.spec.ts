import { test, expect } from './fixtures';
import { ADMIN_REQUESTS_PATH } from './admin.const';
import { createAdminCode } from './admin.utils';

test('DEV-01 DEV-04: админка требует отдельный вход и восстанавливается после истечения сессии', async ({ page, context }) => {
  const anonymous = await page.request.get(ADMIN_REQUESTS_PATH, { maxRedirects: 0 });
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers().location).toBeUndefined();
  const denied = await page.request.post('/api/ApiSchool/provisioning-requests/11111111-1111-4111-8111-111111111111/approve', { maxRedirects: 0 });
  expect(denied.status()).toBe(401);
  await page.goto('/developer');
  await expect(page.getByText('Войдите как администратор, чтобы просмотреть заявки.').first()).toBeVisible();
  await page.getByRole('link', { name: 'Войти', exact: true }).click();
  await page.getByLabel('Код безопасности').fill(createAdminCode());
  await page.getByRole('button', { name: 'Подтвердить доступ' }).click();
  await expect(page).toHaveURL(/\/developer$/);
  const authorized = await page.request.get(ADMIN_REQUESTS_PATH);
  expect(authorized.ok()).toBe(true);
  expect(Array.isArray(await authorized.json())).toBe(true);
  await context.clearCookies();
  await page.reload();
  await expect(page.getByRole('link', { name: 'Войти', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Одобрить', exact: true })).toHaveCount(0);
});
