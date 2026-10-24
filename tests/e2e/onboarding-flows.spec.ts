import { test, expect } from './fixtures';
import { loginAdmin } from './admin.utils';
import { ERROR_RESPONSE } from './flows.const';
import { PROVISION_TIMEOUT_MS } from './admin.const';
import { uniqueName, readJson } from './flows.utils';
import { SCHOOL_REQUEST_STORAGE_KEY } from '../../src/Services/Onboarding/onboarding.const';

test('ONB-02: пустое название не отправляет заявку', async ({ actors }) => {
  const { page, identity } = await actors('new');
  await page.goto('/onboarding');
  await page.getByLabel('Название школы').fill('   ');
  await page.getByTestId('onboarding-school-submit').click();
  await expect(page.getByText('Введите название школы', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/onboarding$/);
  expect(await page.evaluate(key => localStorage.getItem(key), `${SCHOOL_REQUEST_STORAGE_KEY}:${identity.userPublicId}`)).toBeNull();
});

for (const decision of ['approve', 'reject'] as const) {
  test(`ONB-03 ONB-04 ONB-05 ONB-06 ONB-11 DEV-02 DEV-03 JOURNEY-01: решение ${decision} видно заявителю`, async ({ actors }) => {
    test.setTimeout(PROVISION_TIMEOUT_MS * 2);
    const applicant = await actors('new');
    const admin = await actors('owner');
    await loginAdmin(admin.page);
    const schoolName = uniqueName('Школа заявителя');
    await applicant.page.goto('/onboarding');
    await expect(applicant.page.locator('[aria-current="step"]')).toContainText('Школа');
    await applicant.page.getByLabel('Название школы').fill(` ${schoolName} `);
    await applicant.page.getByTestId('onboarding-school-submit').click();
    await expect(applicant.page).toHaveURL(/\/onboarding\/waiting\/[^/]+$/);
    const requestKey = `${SCHOOL_REQUEST_STORAGE_KEY}:${applicant.identity.userPublicId}`;
    expect(await applicant.page.evaluate(key => localStorage.getItem(key), requestKey)).not.toBeNull();
    const waitingPath = new URL(applicant.page.url()).pathname;
    await expect(applicant.page.locator('[aria-current="step"]')).toContainText('Доступ');
    await applicant.page.reload();
    await expect(applicant.page.getByRole('heading', { name: 'Заявка на рассмотрении' })).toBeVisible();
    await applicant.page.goto('/onboarding');
    await expect(applicant.page).toHaveURL(new RegExp(`${waitingPath}$`));
    await admin.page.goto('/developer');
    const requestId = waitingPath.split('/').pop();
    const row = admin.page.getByTestId(`school-request-${requestId}`);
    await expect(row.getByRole('heading', { name: schoolName, exact: true })).toBeVisible();
    await row.getByTestId(`school-request-${decision === 'approve' ? 'approve' : 'reject'}`).click();
    if (decision === 'approve') {
      await expect(applicant.page).toHaveURL(/\/app\/schools\/[^/]+\/today$/, { timeout: PROVISION_TIMEOUT_MS });
      const schools = await readJson<Array<{ schoolName: string; roles: string[] }>>(await applicant.page.request.get('/api/ApiSchool/my-schools'));
      expect(schools.find(school => school.schoolName === schoolName)?.roles).toContain('Owner');
      expect(await applicant.page.evaluate(key => localStorage.getItem(key), requestKey)).toBeNull();
      await applicant.page.reload();
      await expect(applicant.page).toHaveURL(/\/today$/);
    } else {
      await expect(applicant.page.getByRole('heading', { name: 'Заявку не удалось подтвердить' })).toBeVisible({ timeout: PROVISION_TIMEOUT_MS });
      await expect(applicant.page.locator('[aria-current="step"]')).toContainText('Школа');
      await expect(applicant.page.getByLabel('Название школы')).toHaveValue(schoolName);
    }
  });
}

for (const route of ['/onboarding', '/onboarding/waiting/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']) {
  test(`PROFILE-05: профиль и выход доступны без готовой школы на ${route}`, async ({ actors }) => {
    const { page } = await actors('new');
    await page.goto(route);
    await page.getByTestId('profile-open').click();
    await expect(page).toHaveURL(/\/app\/profile$/);
    await page.getByTestId('profile-logout').click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
}

test('ONB-08: ошибка статуса собственной заявки восстанавливается повтором', { tag: '@ui-errors' }, async ({ actors }) => {
  test.setTimeout(PROVISION_TIMEOUT_MS * 2);
  const { page } = await actors('new');
  await page.goto('/onboarding');
  await page.getByLabel('Название школы').fill(uniqueName('Повтор статуса'));
  await page.getByTestId('onboarding-school-submit').click();
  await expect(page).toHaveURL(/\/onboarding\/waiting\//);
  const requestId = new URL(page.url()).pathname.split('/').pop();
  const endpoint = `**/api/ApiAuth/request-school/${requestId}/status`;
  await page.route(endpoint, route => route.fulfill(ERROR_RESPONSE));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Не удалось проверить заявку', exact: true })).toBeVisible({ timeout: PROVISION_TIMEOUT_MS });
  await expect(page.getByText('Есть приглашение в другую школу?', { exact: true })).toBeVisible();
  await page.unroute(endpoint);
  await page.getByTestId('onboarding-status-retry').click();
  await expect(page.getByRole('heading', { name: 'Заявка на рассмотрении', exact: true })).toBeVisible();
});
