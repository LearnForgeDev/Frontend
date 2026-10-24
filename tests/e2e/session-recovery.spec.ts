import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';

test('SESSION-05 SESSION-09: истёкший локальный срок запускает один refresh перед параллельными чтениями', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  const initialStudents = page.waitForResponse(response => response.url().endsWith(`/ApiStudents/${SCHOOL_ID}`));
  await page.goto(`${SCHOOL_PATH}/today`);
  expect((await initialStudents).ok()).toBe(true);
  await expect(page.getByRole('heading', { name: /^Сегодня,/ })).toBeVisible();
  let refreshCount = 0;
  page.on('request', request => { if (request.url().endsWith('/ApiAuth/refreshToken')) refreshCount++; });
  await page.evaluate(() => {
    const identity = JSON.parse(localStorage.getItem('user_identity')!);
    localStorage.setItem('user_identity', JSON.stringify({ ...identity, exp: Date.now() - 1 }));
  });
  const students = page.waitForResponse(response => response.url().endsWith(`/ApiStudents/${SCHOOL_ID}`));
  const invites = page.waitForResponse(response => response.url().endsWith(`/ApiAuth/invites/${SCHOOL_ID}`));
  await page.getByTestId('nav-desktop-students').click();
  expect((await students).ok()).toBe(true);
  expect((await invites).ok()).toBe(true);
  expect(refreshCount).toBe(1);
  await expect(page.getByRole('table', { name: 'Ученики школы' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Приглашения', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('user_identity')!).exp > Date.now())).toBe(true);
});

test('SESSION-08: поздний ответ уроков не восстанавливает пользователя после выхода', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.goto(`${SCHOOL_PATH}/today`);
  await expect(page.getByTestId('profile-open')).toBeVisible();
  let release!: () => void;
  let started!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const ready = new Promise<void>(resolve => { started = resolve; });
  await page.route(`**/api/ApiLessons/${SCHOOL_ID}/all`, async route => {
    const response = await route.fetch();
    started();
    await gate;
    await route.fulfill({ response });
  });
  try {
    await page.goto(`${SCHOOL_PATH}/lessons`);
    await ready;
    await page.getByTestId('profile-open').click();
    await page.getByTestId('profile-logout').click();
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
  expect(await page.evaluate(() => localStorage.getItem('user_identity'))).toBeNull();
  await page.goto(`${SCHOOL_PATH}/lessons`);
  await expect(page.getByTestId('auth-login-submit')).toBeVisible();
  await expect(page.getByTestId('nav-desktop-lessons')).toHaveCount(0);
});
