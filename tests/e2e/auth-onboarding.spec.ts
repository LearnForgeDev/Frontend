import { test, expect } from './fixtures';
import { BACKEND_TIMEOUT_MS, CI_PASSWORD, SCHOOL_PATH } from './core.const';

test('вход возвращает полный исходный адрес', async ({ page }) => {
  const target = `${SCHOOL_PATH}/lessons?source=auth-check#materials`;
  await page.goto(target);
  await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
  await page.getByLabel(/^Имя/i).fill('ci-owner');
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(target, { timeout: BACKEND_TIMEOUT_MS });
});

test('заявки изолированы, недоступная заявка не блокирует onboarding', async ({ page }) => {
  const owner = `ci-request-owner-${Date.now()}`;
  const student = `ci-request-student-${Date.now()}`;
  await page.goto('/auth/register');
  await page.getByLabel(/^Имя пользователя/i).fill(owner);
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByLabel(/^Подтвердите пароль/i).fill(CI_PASSWORD);
  await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: BACKEND_TIMEOUT_MS });
  await expect(page.getByText(owner, { exact: true })).toBeVisible();
  await page.getByLabel('Название школы').fill('Изолированная заявка CI');
  await page.getByRole('button', { name: 'Создать школу', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Заявка на рассмотрении' })).toBeVisible();
  const waitingUrl = page.url();
  await page.getByRole('button', { name: 'Открыть профиль' }).click();
  await page.getByRole('button', { name: 'Выйти' }).click();
  await page.getByRole('link', { name: 'Зарегистрироваться' }).click();
  await page.getByLabel(/^Имя пользователя/i).fill(student);
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByLabel(/^Подтвердите пароль/i).fill(CI_PASSWORD);
  await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: BACKEND_TIMEOUT_MS });
  await expect(page.getByRole('button', { name: 'Создать школу', exact: true })).toBeVisible();
  await page.goto(waitingUrl);
  await expect(page.getByRole('heading', { name: 'Заявка недоступна' })).toBeVisible();
  await page.getByRole('button', { name: 'К выбору школы' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole('button', { name: 'Открыть профиль' }).click();
  await page.getByRole('button', { name: 'Выйти' }).click();
  await page.getByLabel(/^Имя/i).fill(owner);
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(waitingUrl, { timeout: BACKEND_TIMEOUT_MS });
  await expect(page.getByRole('heading', { name: 'Заявка на рассмотрении' })).toBeVisible();
});

test('регистрация сохраняет приглашение и якорь исходного пути', async ({ page }) => {
  const target = '/onboarding?invite=ci-test-invite#join';
  await page.goto(target);
  await page.getByRole('link', { name: 'Зарегистрироваться' }).click();
  await page.getByLabel(/^Имя пользователя/i).fill(`ci-invite-${Date.now()}`);
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByLabel(/^Подтвердите пароль/i).fill(CI_PASSWORD);
  await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page).toHaveURL(target, { timeout: BACKEND_TIMEOUT_MS });
  await expect(page.getByRole('button', { name: 'Вступить в школу' })).toBeVisible();
});
