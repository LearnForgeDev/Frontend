import { test, expect } from './fixtures';
import { ADMIN_REQUESTS_PATH } from './admin.const';
import { loginAdmin } from './admin.utils';

test('DEV-01 DEV-04: API администрирования требует отдельный вход и запрещает доступ после истечения сессии', async ({ page, context }) => {
  const anonymous = await page.request.get(ADMIN_REQUESTS_PATH, { maxRedirects: 0 });
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers().location).toBeUndefined();
  const denied = await page.request.post('/api/ApiSchool/provisioning-requests/11111111-1111-4111-8111-111111111111/approve', { maxRedirects: 0 });
  expect(denied.status()).toBe(401);
  await loginAdmin(page);
  const authorized = await page.request.get(ADMIN_REQUESTS_PATH);
  expect(authorized.ok()).toBe(true);
  expect(Array.isArray(await authorized.json())).toBe(true);
  await context.clearCookies();
  const expired = await page.request.get(ADMIN_REQUESTS_PATH, { maxRedirects: 0 });
  expect(expired.status()).toBe(401);
});
