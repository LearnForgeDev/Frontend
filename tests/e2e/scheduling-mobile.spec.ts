import { devices } from '@playwright/test';
import { test, expect } from './fixtures';
import { login } from './auth.utils';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';

test.use({ ...devices['Pixel 5'] });

test('телефон: создание занятия, предыдущий день и возврат к сегодня', async ({ page }, testInfo) => {
  await login(page, 'teacher');
  await page.goto(`${SCHOOL_PATH}/schedule`);
  await page.getByTestId('schedule-create').click();
  const title = `Мобильное занятие ${Date.now()}`;
  await page.getByLabel(/^Название/i).fill(title);
  await page.getByRole('checkbox', { name: 'Занятие без учеников' }).check();
  const created = page.waitForResponse(response => response.request().method() === 'POST' && response.url().includes(`/api/ApiSchedule/${SCHOOL_ID}/events`));
  await page.getByRole('button', { name: 'Создать', exact: true }).click();
  const response = await created;
  expect(response.ok(), await response.text()).toBe(true);
  const saved = await response.json();
  const calendar = page.getByTestId('schedule-calendar');
  const calendarEvent = calendar.getByRole('heading', { name: title, exact: true });
  await expect(calendarEvent).toBeVisible();
  await page.getByTestId('schedule-previous').click();
  await expect(calendarEvent).toHaveCount(0);
  await page.getByTestId('schedule-today').click();
  await expect(calendarEvent).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('mobile-schedule.png'), fullPage: true });
  expect((await page.request.delete(`/api/ApiSchedule/${SCHOOL_ID}/events/${saved.id}`)).ok()).toBe(true);
});
