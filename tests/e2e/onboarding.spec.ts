import { test, expect } from './fixtures';
import { BACKEND_TIMEOUT_MS, CI_PASSWORD } from './core.const';
import { WAITING_SCHOOL_NAME, WAITING_VIEWPORT_HEIGHT, WAITING_VIEWPORT_WIDTHS } from './onboarding.const';

test('ONB-03 ONB-04 ONB-09 ONB-10: заявка и компактная страница ожидания работают с настоящим backend', async ({ page }, testInfo) => {
  await page.goto('/auth/register');
  await page.getByLabel(/^Имя пользователя/i).fill(`ci-waiting-${Date.now()}`);
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByLabel(/^Подтвердите пароль/i).fill(CI_PASSWORD);
  await page.getByTestId('auth-register-submit').click();
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: BACKEND_TIMEOUT_MS });
  await page.getByLabel('Название школы').fill(WAITING_SCHOOL_NAME);
  await page.getByTestId('onboarding-school-submit').click();
  await expect(page).toHaveURL(/\/onboarding\/waiting\/[^/]+$/, { timeout: BACKEND_TIMEOUT_MS });
  await expect(page.getByRole('heading', { name: 'Заявка на рассмотрении' })).toBeVisible();
  await expect(page.getByText(/текущая заявка останется активной/)).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Скоротать время' })).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);

  for (const width of WAITING_VIEWPORT_WIDTHS) {
    await page.setViewportSize({ width, height: WAITING_VIEWPORT_HEIGHT });
    const title = page.getByRole('heading', { name: 'Заявка на рассмотрении' });
    const heading = await title.boundingBox();
    const clock = await page.locator('[aria-live="polite"]').filter({ has: title }).locator('svg').boundingBox();
    expect(heading).not.toBeNull();
    expect(clock).not.toBeNull();
    expect(clock!.x).toBeGreaterThanOrEqual(heading!.x + heading!.width);
    const progress = await page.getByLabel('Прогресс настройки').boundingBox();
    const main = await page.getByRole('main').boundingBox();
    expect(progress).not.toBeNull();
    expect(main).not.toBeNull();
    expect(main!.y - progress!.y - progress!.height).toBeLessThanOrEqual(96);
    const cardRadii = await page.getByRole('main').locator('.MuiPaper-root').evaluateAll((cards) => cards.map((card) => parseFloat(getComputedStyle(card).borderTopLeftRadius)));
    expect(cardRadii.every((radius) => radius <= 16)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await testInfo.attach(`ожидание-${width}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  }

  await expect(page.getByLabel('Код приглашения')).toHaveCount(0);
  await expect(page.getByText('Откройте ссылку-приглашение')).toBeVisible();
  await expect(page.getByText('Нет ссылки? Попросите её у преподавателя или владельца школы.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Заявка на рассмотрении' })).toBeVisible();
});
