import { test, expect } from './fixtures';
import { login } from './auth.utils';
import { BACKEND_TIMEOUT_MS, SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { EXPIRED_SESSION_TIMESTAMP, SESSION_REFRESH_CASES, SESSION_REFRESH_PATH } from './session-refresh.const';

for (const { name, removeCookie } of SESSION_REFRESH_CASES) {
  test(`${name}: обновление токена сохраняет страницу и загружает данные настоящего backend`, async ({ page, context }) => {
    await login(page);
    await page.goto(`${SCHOOL_PATH}/lessons`);
    await expect(page.getByRole('heading', { name: 'Мои уроки' })).toBeVisible();
    const previousRefreshToken = await page.evaluate(() => JSON.parse(localStorage.getItem('user_identity')!).refreshToken);
    if (removeCookie) {
      await context.clearCookies();
    } else {
      await page.evaluate((exp) => {
        const identity = JSON.parse(localStorage.getItem('user_identity')!);
        localStorage.setItem('user_identity', JSON.stringify({ ...identity, exp }));
      }, EXPIRED_SESSION_TIMESTAMP);
    }
    const rejectedRequests: number[] = [];
    page.on('response', (response) => {
      if (new URL(response.url()).pathname === `/api/ApiFiles/${SCHOOL_ID}` && response.status() === 401) {
        rejectedRequests.push(response.status());
      }
    });
    const refreshed = page.waitForResponse((response) =>
      new URL(response.url()).pathname === SESSION_REFRESH_PATH && response.ok());
    const loaded = page.waitForResponse((response) =>
      new URL(response.url()).pathname === `/api/ApiFiles/${SCHOOL_ID}` && response.ok());

    await page.getByRole('navigation', { name: 'Разделы школы' }).getByRole('button', { name: 'Материалы', exact: true }).click();
    await Promise.all([refreshed, loaded]);

    await expect(page).toHaveURL(`${SCHOOL_PATH}/files`, { timeout: BACKEND_TIMEOUT_MS });
    await expect(page.getByRole('navigation', { name: 'Разделы школы' })).toBeVisible();
    const identity = await page.evaluate(() => JSON.parse(localStorage.getItem('user_identity')!));
    expect(identity.refreshToken).not.toBe(previousRefreshToken);
    expect(identity.exp).toBeGreaterThan(Date.now());
    expect(identity.activeSchoolPublicId).toBe(SCHOOL_ID);
    expect(rejectedRequests).toHaveLength(removeCookie ? 1 : 0);
  });
}
