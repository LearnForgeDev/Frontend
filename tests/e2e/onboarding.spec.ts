import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect } from './fixtures';
import { BACKEND_TIMEOUT_MS, CI_PASSWORD } from './core.const';
import { GAME_OVER_TIMEOUT_MS, WAITING_SCHOOL_NAME, WAITING_VIEWPORT_HEIGHT, WAITING_VIEWPORT_WIDTHS } from './onboarding.const';

test.use({ hasTouch: true });

function containsGameModule(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsGameModule);
  if (!value || typeof value !== 'object') return false;
  const names = [
    'nameForCondition' in value ? value.nameForCondition : undefined,
    'name' in value ? value.name : undefined,
    'identifier' in value ? value.identifier : undefined,
  ];
  return names.some(name => typeof name === 'string' && /node_modules\/404game\//.test(name.replaceAll('\\', '/')))
    || ('modules' in value && containsGameModule(value.modules))
    || ('children' in value && containsGameModule(value.children));
}

async function getGameAssetPaths(): Promise<Set<string>> {
  const stats: unknown = JSON.parse(await readFile(resolve('.next/client-stats.json'), 'utf8'));
  if (!stats || typeof stats !== 'object' || !('chunks' in stats) || !Array.isArray(stats.chunks)) {
    throw new Error('Client compiler chunk data is missing.');
  }
  const chunks: unknown[] = stats.chunks;
  const gameChunks = chunks.filter(containsGameModule);
  expect(gameChunks.length, 'Compiler chunks containing the 404game module').toBeGreaterThan(0);
  const paths = new Set<string>();
  for (const chunk of gameChunks) {
    if (!chunk || typeof chunk !== 'object' || !('files' in chunk) || !Array.isArray(chunk.files)) {
      throw new Error('Game compiler chunk files are missing.');
    }
    expect('initial' in chunk ? chunk.initial : undefined, 'The game module remains outside initial chunks').toBe(false);
    const files: unknown[] = chunk.files;
    for (const file of files) {
      if (typeof file !== 'string' || !file.endsWith('.js')) continue;
      const path = file.replaceAll('\\', '/');
      expect(path, 'Game client JavaScript asset').toMatch(/^static\/.*\.js$/);
      paths.add(`/_next/${path}`);
    }
  }
  expect(paths.size, 'Emitted JavaScript assets containing the game').toBeGreaterThan(0);
  return paths;
}

test('ONB-03 ONB-04 ONB-09 ONB-10: заявка, адаптивная карточка и готовая игра работают с настоящим backend', async ({ page }, testInfo) => {
  const gameAssets = await getGameAssetPaths();
  const gameRequests: string[] = [];
  page.on('request', (request) => {
    if (gameAssets.has(new URL(request.url()).pathname)) gameRequests.push(request.url());
  });
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

  expect(gameRequests).toHaveLength(0);
  await Promise.all([
    page.waitForRequest(request => gameAssets.has(new URL(request.url()).pathname)),
    page.getByRole('button', { name: 'Скоротать время' }).click(),
  ]);
  await page.getByRole('button', { name: 'Начать', exact: true }).click();
  expect(gameRequests.length).toBeGreaterThan(0);
  const canvas = page.getByLabel('Игра Динозаврик. Пробел — прыжок', { exact: true });
  await expect(canvas).toBeFocused();
  await canvas.press('Space');
  const field = await canvas.boundingBox();
  expect(field).not.toBeNull();
  await page.touchscreen.tap(field!.x + field!.width / 2, field!.y + field!.height / 2);
  await expect(page.getByLabel('Код приглашения')).toHaveCount(0);
  await expect(page.getByText('Откройте ссылку-приглашение')).toBeVisible();
  await expect(page.getByText('Нет ссылки? Попросите её у преподавателя или владельца школы.')).toBeVisible();
  await page.getByRole('button', { name: 'Ещё раз', exact: true }).waitFor({ timeout: GAME_OVER_TIMEOUT_MS });
  await page.getByRole('button', { name: 'Ещё раз', exact: true }).click();
  await expect(canvas).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByText('Анимация отключена в настройках системы')).toBeVisible();
  await expect(canvas).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Заявка на рассмотрении' })).toBeVisible();
});
