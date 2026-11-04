import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { expireStoredJwt } from './auth.utils';
import { CI_PASSWORD, SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { ERROR_RESPONSE } from './flows.const';
import { uniqueName } from './flows.utils';
import { SESSION_REFRESH_PATH } from './session-refresh.const';

async function signOutAndExpectLogin(page: Page, testId: string) {
  const navigation = page.waitForRequest(request => request.isNavigationRequest()
    && request.resourceType() === 'document' && new URL(request.url()).pathname === '/auth/login');
  await page.getByTestId(testId).click();
  await navigation;
  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByTestId('auth-login-submit')).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('user_identity'))).toBeNull();
}

test('SESSION-10: a failed restore can be discarded before signing in as another user', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.route(`**${SESSION_REFRESH_PATH}`, route => route.fulfill(ERROR_RESPONSE));
  await page.goto(`${SCHOOL_PATH}/lessons`);
  await expect(page.getByRole('button', { name: 'Повторить', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('user_identity'))).not.toBeNull();
  await expect(page.getByRole('navigation', { name: 'Разделы школы' })).toHaveCount(0);
  await signOutAndExpectLogin(page, 'session-restore-login');
  await page.getByLabel(/^Имя/).fill('ci-teacher');
  await page.getByLabel(/^Пароль/).fill(CI_PASSWORD);
  await page.getByTestId('auth-login-submit').click();
  await expect(page).toHaveURL(`${SCHOOL_PATH}/today`);
  await expect(page.getByRole('navigation', { name: 'Разделы школы' })).toBeVisible();
});

test('SESSION-11: a pending restore has an immediate sign-in escape', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  let release!: () => void;
  let started!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const ready = new Promise<void>(resolve => { started = resolve; });
  await page.route(`**${SESSION_REFRESH_PATH}`, async route => {
    started();
    await gate;
    await route.abort('failed');
  });
  try {
    await page.goto(`${SCHOOL_PATH}/lessons`);
    await ready;
    await expect(page.getByRole('navigation', { name: 'Разделы школы' })).toHaveCount(0);
    await signOutAndExpectLogin(page, 'session-restore-login');
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
  expect(await page.evaluate(() => localStorage.getItem('user_identity'))).toBeNull();
});

for (const mode of ['login', 'register']) {
  test(`SESSION-12: ${mode} remains reachable when stored-session restore fails`, { tag: '@ui-errors' }, async ({ actors }) => {
    const { page } = await actors();
    const target = '/onboarding?invite=ci-recovery-link#join';
    const search = new URLSearchParams({ returnTo: target });
    await page.route(`**${SESSION_REFRESH_PATH}`, route => route.fulfill(ERROR_RESPONSE));
    const failedRestore = page.waitForResponse(response => new URL(response.url()).pathname === SESSION_REFRESH_PATH && response.status() === 503);
    await page.goto(`/auth/${mode}?${search}`);
    await failedRestore;
    await expect(page.getByTestId(`auth-${mode}-submit`)).toBeEnabled();
    await expect(page.getByTestId('session-restore-login')).toHaveCount(0);
    const alternate = page.getByRole('link', { name: mode === 'login' ? 'Зарегистрироваться' : 'Войти', exact: true });
    await alternate.click();
    await expect(page.getByTestId(`auth-${mode === 'login' ? 'register' : 'login'}-submit`)).toBeEnabled();
    expect(new URL(page.url()).searchParams.get('returnTo')).toBe(target);
  });
}

for (const status of [401, 403]) {
  test(`SESSION-13: expired JWT and rejected refresh ${status} allow a fresh login`, { tag: status === 403 ? '@ui-errors' : '@backend' }, async ({ actors }) => {
    const { page } = await actors();
    await page.goto(`${SCHOOL_PATH}/today`);
    await expect(page.getByRole('heading', { name: /^Сегодня,/ })).toBeVisible();
    await expireStoredJwt(page, 'ci-rejected-refresh-token');
    if (status === 403) {
      await page.route(`**${SESSION_REFRESH_PATH}`, route => route.fulfill({ status, contentType: 'application/json', body: '{}' }));
    }
    const rejected = page.waitForResponse(response => new URL(response.url()).pathname === SESSION_REFRESH_PATH);
    await page.getByTestId('nav-desktop-files').click();
    expect((await rejected).status()).toBe(status);
    await expect(page.getByTestId('auth-login-submit')).toBeEnabled();
    await expect(page.getByRole('navigation', { name: 'Разделы школы' })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('user_identity'))).toBeNull();
    const target = `${SCHOOL_PATH}/files`;
    expect(new URL(page.url()).searchParams.get('returnTo')).toBe(target);
    await page.getByLabel(/^Имя/).fill('ci-teacher');
    await page.getByLabel(/^Пароль/).fill(CI_PASSWORD);
    const loaded = page.waitForResponse(response => new URL(response.url()).pathname === `/api/ApiFiles/${SCHOOL_ID}` && response.ok());
    await page.getByTestId('auth-login-submit').click();
    await loaded;
    await expect(page).toHaveURL(target);
    await expect(page.getByRole('navigation', { name: 'Разделы школы' })).toBeVisible();
  });
}

test('SESSION-14: a second protected 401 after refresh returns to usable login', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.goto(`${SCHOOL_PATH}/today`);
  await expect(page.getByRole('heading', { name: /^Сегодня,/ })).toBeVisible();
  let rejectedRequests = 0;
  await page.route(url => url.pathname === `/api/ApiFiles/${SCHOOL_ID}`, route => {
    rejectedRequests++;
    return route.fulfill({ status: 401, contentType: 'application/json', body: '{}' });
  });
  const refreshed = page.waitForResponse(response => new URL(response.url()).pathname === SESSION_REFRESH_PATH && response.ok());
  await page.getByTestId('nav-desktop-files').click();
  await refreshed;
  await expect(page.getByTestId('auth-login-submit')).toBeEnabled();
  expect(rejectedRequests).toBe(2);
  expect(await page.evaluate(() => localStorage.getItem('user_identity'))).toBeNull();
  await page.goto('/auth/login');
  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByTestId('auth-login-submit')).toBeEnabled();
});

test('SESSION-15: My Schools transport failure still permits profile logout', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.route('**/api/ApiSchool/my-schools', route => route.fulfill(ERROR_RESPONSE));
  await page.goto('/app/schools');
  await expect(page.getByRole('alert').filter({ hasText: 'Не удалось загрузить список школ.' })).toBeVisible();
  await page.getByTestId('profile-open').click();
  await expect(page.getByTestId('profile-logout')).toBeEnabled();
  await signOutAndExpectLogin(page, 'profile-logout');
  await page.goto('/auth/login');
  await expect(page.getByTestId('auth-login-submit')).toBeEnabled();
});

for (const stage of ['selection', 'waiting', 'status-error']) {
  test(`ONB-12: direct logout works during ${stage} without a ready school`, { tag: stage === 'status-error' ? '@ui-errors' : '@backend' }, async ({ actors }) => {
    const { page } = await actors('new');
    await page.goto('/app/schools');
    await expect(page.getByTestId('school-add')).toBeVisible();
    await page.goto('/onboarding');
    await expect(page.getByTestId('onboarding-school-submit')).toBeVisible();
    if (stage !== 'selection') {
      await page.getByLabel('Название школы').fill(uniqueName('Выход из ожидания'));
      await page.getByTestId('onboarding-school-submit').click();
      await expect(page).toHaveURL(/\/onboarding\/waiting\/[^/]+$/);
      await expect(page.getByRole('heading', { name: 'Заявка на рассмотрении', exact: true })).toBeVisible();
      if (stage === 'status-error') {
        const requestId = new URL(page.url()).pathname.split('/').pop();
        await page.route(`**/api/ApiAuth/request-school/${requestId}/status`, route => route.fulfill(ERROR_RESPONSE));
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Не удалось проверить заявку', exact: true })).toBeVisible();
      }
    }
    await signOutAndExpectLogin(page, 'onboarding-logout');
    await page.goBack();
    await expect(page.getByTestId('auth-login-submit')).toBeEnabled();
    await expect(page.getByTestId('onboarding-logout')).toHaveCount(0);
  });
}
