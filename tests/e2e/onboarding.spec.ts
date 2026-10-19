import { test, expect } from './fixtures';
import { BACKEND_TIMEOUT_MS, CI_PASSWORD } from './core.const';
import { GAME_OVER_TIMEOUT_MS, WAITING_SCHOOL_NAME, WAITING_VIEWPORT_HEIGHT, WAITING_VIEWPORT_WIDTHS } from './onboarding.const';

test.use({ hasTouch: true });

test('заявка, адаптивная карточка и готовая игра работают с настоящим backend', async ({ page }, testInfo) => {
  const gameRequests: string[] = [];
  page.on('request', (request) => {
    if (/404game.*\.js/.test(request.url())) gameRequests.push(request.url());
  });
  await page.goto('/auth/register');
  await page.getByLabel(/^Имя пользователя/i).fill(`ci-waiting-${Date.now()}`);
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByLabel(/^Подтвердите пароль/i).fill(CI_PASSWORD);
  await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: BACKEND_TIMEOUT_MS });
  await page.getByLabel('Название школы').fill(WAITING_SCHOOL_NAME);
  await page.getByRole('button', { name: 'Создать школу', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding\/waiting\/[^/]+$/, { timeout: BACKEND_TIMEOUT_MS });
  await expect(page.getByRole('heading', { name: 'Заявка на рассмотрении' })).toBeVisible();
  await expect(page.getByText(/текущая заявка останется активной/)).toHaveCount(1);
  expect(gameRequests).toHaveLength(0);

  for (const width of WAITING_VIEWPORT_WIDTHS) {
    await page.setViewportSize({ width, height: WAITING_VIEWPORT_HEIGHT });
    const title = page.getByRole('heading', { name: 'Заявка на рассмотрении' });
    const heading = await title.boundingBox();
    const clock = await page.locator('[aria-live="polite"]').filter({ has: title }).locator('svg').boundingBox();
    expect(heading).not.toBeNull();
    expect(clock).not.toBeNull();
    expect(clock!.x).toBeGreaterThanOrEqual(heading!.x + heading!.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await testInfo.attach(`ожидание-${width}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  }

  await page.getByRole('button', { name: 'Скоротать время' }).click();
  await page.getByRole('button', { name: 'Начать', exact: true }).click();
  expect(gameRequests.length).toBeGreaterThan(0);
  const canvas = page.getByLabel('Игра Динозаврик. Пробел — прыжок', { exact: true });
  await expect(canvas).toBeFocused();
  await canvas.press('Space');
  const field = await canvas.boundingBox();
  expect(field).not.toBeNull();
  await page.touchscreen.tap(field!.x + field!.width / 2, field!.y + field!.height / 2);
  const invite = page.getByLabel('Код приглашения', { exact: true });
  await invite.fill('wasd');
  await invite.press('Space');
  await invite.press('w');
  await expect(invite).toHaveValue('wasd w');
  await page.getByRole('button', { name: 'Ещё раз', exact: true }).waitFor({ timeout: GAME_OVER_TIMEOUT_MS });
  await page.getByRole('button', { name: 'Ещё раз', exact: true }).click();
  await expect(canvas).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByText('Анимация отключена в настройках системы')).toBeVisible();
  await expect(canvas).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Заявка на рассмотрении' })).toBeVisible();
});
