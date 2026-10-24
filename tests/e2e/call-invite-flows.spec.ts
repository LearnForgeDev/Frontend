import { randomUUID } from 'node:crypto';
import { test, expect } from './fixtures';
import { SCHOOL_PATH } from './core.const';

test('CALL-07: недоступный клиент конференции показывает ошибку и допускает повтор', async ({ actors }) => {
  const { page } = await actors('teacher');
  const room = randomUUID();
  const token = page.waitForResponse(response => response.url().endsWith('/api/ApiMeet/token') && response.request().method() === 'POST');
  await page.goto(`${SCHOOL_PATH}/calls?room=${room}`);
  expect((await token).ok()).toBe(true);
  await expect(page.getByText('Не удалось войти в звонок', { exact: true })).toBeVisible();
  await expect(page.getByTestId('call-invite-open')).toHaveCount(0);
  const retried = page.waitForResponse(response => response.url().endsWith('/api/ApiMeet/token') && response.request().method() === 'POST');
  await page.getByTestId('call-retry').click();
  expect((await retried).ok()).toBe(true);
  await expect(page.getByText('Не удалось войти в звонок', { exact: true })).toBeVisible();
  await page.getByTestId('call-close').click();
  await expect(page.getByText('Звонок не выбран', { exact: true })).toBeVisible();
});
