import { test, expect } from './fixtures';
import { BACKEND_TIMEOUT_MS, CI_PASSWORD } from './core.const';
import { SCHOOL_REQUEST_POLLING_INTERVAL_MS, SCHOOL_REQUEST_STORAGE_KEY } from '../../src/Services/Onboarding/onboarding.const';

test('чужая сохранённая заявка не блокирует новый аккаунт и не перезапускает загрузку', async ({ page }) => {
  const requestPublicId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  await page.addInitScript(({ key, requestPublicId }) => {
    localStorage.setItem(key, JSON.stringify({
      requestPublicId, schoolName: 'Старая заявка', knownSchoolPublicIds: [],
    }));
  }, { key: SCHOOL_REQUEST_STORAGE_KEY, requestPublicId });
  await page.goto('/auth/register');
  await page.getByLabel(/^Имя пользователя/i).fill(`ci-isolation-${Date.now()}`);
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByLabel(/^Подтвердите пароль/i).fill(CI_PASSWORD);
  await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: BACKEND_TIMEOUT_MS });
  await expect(page.getByLabel('Название школы')).toBeVisible();

  let statusRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes(`/request-school/${requestPublicId}/status`)) statusRequests += 1;
  });
  await page.clock.install();
  await page.goto(`/onboarding/waiting/${requestPublicId}`);
  await expect(page.getByRole('heading', { name: 'Не удалось проверить заявку' })).toBeVisible();
  const invite = page.getByLabel('Код приглашения', { exact: true });
  await invite.fill('черновик приглашения');
  await page.clock.fastForward(SCHOOL_REQUEST_POLLING_INTERVAL_MS * 3);
  expect(statusRequests).toBe(1);
  await expect(invite).toHaveValue('черновик приглашения');
  await page.getByRole('button', { name: 'К моим школам', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByLabel('Название школы')).toBeVisible();
});
