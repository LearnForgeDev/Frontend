import { test, expect } from './fixtures';
import { login } from './auth.utils';
import { BACKEND_TIMEOUT_MS, CI_PASSWORD, SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { PROFILE_MOBILE_VIEWPORT } from './profile.const';

test('AUTH-03 SESSION-01 SESSION-07 PROFILE-04: вход через форму и восстановление сессии после перезагрузки', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel(/^Имя/i).fill('ci-owner');
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByTestId('auth-login-submit').click();
  await expect(page).toHaveURL(`${SCHOOL_PATH}/today`, { timeout: BACKEND_TIMEOUT_MS });
  await page.reload();
  await expect(page.getByRole('navigation', { name: 'Разделы школы' })).toBeVisible();
  await page.goto('/app/profile');
  await page.getByTestId('profile-logout').click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  await page.goto('/app');
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test('AUTH-04: ошибка входа показывает понятное сообщение', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel(/^Имя/i).fill('ci-owner');
  await page.getByLabel(/^Пароль/i).fill('incorrect-password');
  await page.getByTestId('auth-login-submit').click();
  await expect(page.getByRole('alert')).toContainText('Не удалось войти');
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test('AUTH-07 ONB-01: регистрация нового пользователя приводит к подключению школы', async ({ page }, testInfo) => {
  await page.goto('/auth/register');
  await page.getByLabel(/^Имя пользователя/i).fill(`ci-new-${Date.now()}`);
  await page.getByLabel(/^Пароль/i).fill(CI_PASSWORD);
  await page.getByLabel(/^Подтвердите пароль/i).fill(CI_PASSWORD);
  await page.getByTestId('auth-register-submit').click();
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: BACKEND_TIMEOUT_MS });
  await page.goto('/app/profile');
  await expect(page.getByText('Вы пока не состоите ни в одной школе.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Выберите школу' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Создать занятие', exact: true })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('profile-without-schools.png'), fullPage: true });
  await page.getByRole('button', { name: 'Свернуть меню', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Выберите школу' })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('profile-without-schools-collapsed.png'), fullPage: true });
  await page.setViewportSize(PROFILE_MOBILE_VIEWPORT);
  await expect(page.getByRole('button', { name: 'Выберите школу' })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('profile-without-schools-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Добавить школу', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
});

for (const role of ['owner', 'teacher', 'student']) {
  test(`ACCESS-02: права роли ${role} определяют действия с уроками и студентами`, async ({ page }) => {
    await login(page, role);
    await page.goto(`${SCHOOL_PATH}/lessons`);
    await expect(page.getByRole('heading', { name: 'Мои уроки' })).toBeVisible();
    const createButton = page.getByRole('button', { name: 'Создать урок', exact: true });
    if (role === 'student') {
      await expect(createButton).toHaveCount(0);
      await page.goto(`${SCHOOL_PATH}/students`);
      await expect(page).toHaveURL(`${SCHOOL_PATH}/today`);
    } else {
      await expect(createButton).toBeVisible();
      await page.goto(`${SCHOOL_PATH}/students`);
      await expect(page.getByRole('main').first().getByRole('heading', { name: 'Ученики', exact: true })).toBeVisible();
    }
  });
}

for (const [route, endpoint, title] of [
  ['today', `/api/ApiSchedule/${SCHOOL_ID}/events`, 'Сегодня'],
  ['lessons', `/api/ApiLessons/${SCHOOL_ID}/all`, 'Мои уроки'],
  ['files', `/api/ApiFiles/${SCHOOL_ID}`, 'Материалы'],
  ['schedule', `/api/ApiSchedule/${SCHOOL_ID}/events`, ''],
]) {
  test(`COMMON-01: раздел ${route} загружает данные настоящего backend`, async ({ page }) => {
    await login(page);
    const response = page.waitForResponse((response) =>
      new URL(response.url()).pathname === endpoint && response.request().method() === 'GET');
    await page.goto(`${SCHOOL_PATH}/${route}`);
    expect((await response).ok()).toBe(true);
    await expect(page.getByRole('main').first()).toBeVisible();
    if (title) await expect(page.getByRole('main').first().getByRole('heading', { name: new RegExp(`^${title}`) })).toBeVisible();
    else await expect(page.getByTestId('schedule-create')).toBeVisible();
  });
}

test('LESSON-02: создание урока открывает редактор и сохраняет урок на сервере', async ({ page }) => {
  await login(page);
  await page.goto(`${SCHOOL_PATH}/lessons`);
  await page.getByRole('button', { name: 'Создать урок', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${SCHOOL_PATH}/lessons/[^/?]+\\?edit=true$`), {
    timeout: BACKEND_TIMEOUT_MS,
  });
  await expect(page.getByRole('heading', { name: 'Новый урок', exact: true })).toBeVisible();
  const id = new URL(page.url()).pathname.split('/').pop();
  const response = await page.request.get(`/api/ApiLessons/${SCHOOL_ID}/${id}`);
  expect(response.ok()).toBe(true);
  await page.reload();
  await expect(page.getByTestId('lesson-back')).toBeVisible();
  await expect(page.locator('.editor-input[contenteditable="true"]')).toBeVisible();
});

test('FILE-02: загрузка, скачивание и удаление файла работают через MinIO', async ({ page }) => {
  await login(page);
  const fileName = `ci-file-${Date.now()}.txt`;
  await page.goto(`${SCHOOL_PATH}/files`);
  const completed = page.waitForResponse((response) =>
    response.url().includes(`/api/ApiFiles/${SCHOOL_ID}/direct-upload/complete`) && response.request().method() === 'POST');
  await page.getByTestId('files-input').setInputFiles({
    name: fileName, mimeType: 'text/plain', buffer: Buffer.from('Проверка файла CI'),
  });
  expect((await completed).ok()).toBe(true);
  await expect(page.getByText(fileName, { exact: true }).first()).toBeVisible({ timeout: BACKEND_TIMEOUT_MS });
  const response = await page.request.get(`/api/ApiFiles/${SCHOOL_ID}`);
  expect(response.ok()).toBe(true);
  const files = await response.json();
  const uploaded = files.find((file: { fileName: string }) => file.fileName === fileName);
  expect(uploaded).toBeTruthy();
  const content = await page.request.get(`/api/ApiFiles/${SCHOOL_ID}/${uploaded.publicId}/content`);
  expect(content.ok()).toBe(true);
  expect(await content.text()).toBe('Проверка файла CI');
  expect((await page.request.delete(`/api/ApiFiles/${SCHOOL_ID}/${uploaded.publicId}`)).ok()).toBe(true);
  await page.reload();
  await expect(page.getByText(fileName, { exact: true })).toHaveCount(0);
});

test('CHAT-02: чат отправляет сообщение через SignalR и восстанавливает историю', async ({ page }) => {
  await login(page);
  await page.goto(`${SCHOOL_PATH}/chats`);
  await page.getByText('Общий чат CI', { exact: true }).first().click();
  const input = page.getByTestId('chat-message-input');
  await expect(input).toBeEnabled({ timeout: BACKEND_TIMEOUT_MS });
  const message = `Сообщение CI ${Date.now()}`;
  await input.fill(message);
  await expect(page.getByTestId('chat-send')).toBeEnabled({ timeout: BACKEND_TIMEOUT_MS });
  await input.press('Enter');
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  await expect(input).toHaveValue('');
  await page.reload();
  await page.getByText('Общий чат CI', { exact: true }).first().click();
  await expect(page.getByText(message, { exact: true })).toBeVisible();
});

test('CALL-03: звонки выдают токен комнаты только участникам школы', async ({ page }) => {
  await login(page);
  await page.goto(`${SCHOOL_PATH}/calls`);
  const response = await page.request.post('/api/ApiMeet/token', {
    data: { schoolPublicId: SCHOOL_ID, room: `ci-room-${Date.now()}` },
  });
  expect(response.ok(), await response.text()).toBe(true);
  const room = await response.json();
  expect(new URL(room.roomUrl).hostname).toBe('meet.invalid');
  expect(room.token).toBeTruthy();
});

test('ACCESS-01: чужая школа недоступна', async ({ page }) => {
  await login(page, 'student');
  const foreignSchool = '99999999-9999-4999-8999-999999999999';
  await page.goto(`/app/schools/${foreignSchool}/lessons`);
  await expect(page).toHaveURL(/\/app\/schools$/);
  const response = await page.request.get(`/api/ApiLessons/${foreignSchool}/all`);
  expect([403, 404]).toContain(response.status());
});

test('SCHEDULE-03: создание занятия из профиля сохраняет расписание и состав участников', async ({ page }) => {
  await login(page, 'teacher', null);
  await page.goto('/app/profile');
  await page.getByRole('button', { name: 'Создать занятие', exact: true }).click();
  const title = `Занятие CI ${Date.now()}`;
  await page.getByLabel(/^Название/i).fill(title);
  await page.getByLabel(/^Время начала/i).fill('10:00');
  await page.getByLabel(/^Время окончания/i).fill('11:00');
  await page.getByRole('button', { name: 'Все ученики школы', exact: true }).click();
  const created = page.waitForResponse((response) =>
    response.url().includes(`/api/ApiSchedule/${SCHOOL_ID}/events`) && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Создать', exact: true }).click();
  const response = await created;
  expect(response.ok(), await response.text()).toBe(true);
  const list = await page.request.get(`/api/ApiSchedule/${SCHOOL_ID}/events`);
  expect(list.ok()).toBe(true);
  const saved = (await list.json()).find((item: { title: string }) => item.title === title);
  expect(saved).toBeTruthy();
  expect(saved.attendees.length).toBeGreaterThan(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Создать занятие', exact: true })).toBeVisible();
  await page.goto(`${SCHOOL_PATH}/schedule`);
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  await page.goto(`${SCHOOL_PATH}/schedule?eventId=${saved.id}`);
  await page.getByRole('dialog', { name: 'Детали занятия' }).getByRole('button', { name: 'Удалить', exact: true }).click();
  const confirmation = page.getByRole('dialog', { name: 'Удалить занятие?' });
  await expect(confirmation).toContainText(title);
  await confirmation.getByRole('button', { name: 'Отмена', exact: true }).click();
  const afterCancel = await page.request.get(`/api/ApiSchedule/${SCHOOL_ID}/events`);
  expect((await afterCancel.json()).some((item: { id: string }) => item.id === saved.id)).toBe(true);
  await page.reload();
  await page.getByRole('dialog', { name: 'Детали занятия' }).getByRole('button', { name: 'Удалить', exact: true }).click();
  const deleted = page.waitForResponse(response => response.request().method() === 'DELETE' && response.url().endsWith(`/events/${saved.id}`));
  await confirmation.getByRole('button', { name: 'Удалить', exact: true }).click();
  expect((await deleted).ok()).toBe(true);
});
