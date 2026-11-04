import { test, expect } from './fixtures';
import { login } from './auth.utils';
import { SCHOOL_PATH } from './core.const';
import { SIDEBAR_DESKTOP_VIEWPORT } from './sidebar.const';

test.use({ viewport: SIDEBAR_DESKTOP_VIEWPORT });

test('сайдбар сворачивается, освобождает место и сохраняет навигацию', async ({ page }, testInfo) => {
  await login(page, 'teacher');
  await page.goto(`${SCHOOL_PATH}/today`);
  const sidebar = page.getByRole('complementary').first();
  const main = page.getByRole('main').first();
  const navigation = sidebar.getByRole('navigation', { name: 'Разделы школы' });
  await expect(navigation.getByRole('button', { name: 'Расписание', exact: true })).toBeVisible();
  const expanded = await sidebar.boundingBox();
  const mainBefore = await main.boundingBox();
  expect(expanded).not.toBeNull();
  expect(mainBefore).not.toBeNull();
  await page.getByRole('button', { name: 'Свернуть меню', exact: true }).click();
  const expand = page.getByRole('button', { name: 'Развернуть меню', exact: true });
  await expect(expand).toHaveAttribute('aria-expanded', 'false');
  const collapsed = await sidebar.boundingBox();
  const mainAfter = await main.boundingBox();
  expect(collapsed!.width).toBeLessThan(expanded!.width);
  expect(mainAfter!.x).toBeLessThan(mainBefore!.x);
  expect(await navigation.innerText()).toBe('');
  await sidebar.getByRole('button', { name: 'CI School', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: 'Все школы', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await navigation.getByRole('button', { name: 'Расписание', exact: true }).click();
  await expect(page).toHaveURL(`${SCHOOL_PATH}/schedule`);
  await expect(expand).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('sidebar-collapsed.png'), fullPage: true });
  await expand.click();
  await expect(page.getByRole('button', { name: 'Свернуть меню', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation.getByText('Расписание', { exact: true })).toBeVisible();
  expect((await sidebar.boundingBox())!.width).toBe(expanded!.width);
  await page.screenshot({ path: testInfo.outputPath('sidebar-expanded.png'), fullPage: true });
});
