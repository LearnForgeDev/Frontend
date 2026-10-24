import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { OTHER_SCHOOL_ID, OTHER_SCHOOL_PATH, HTTP_DENIED, ERROR_RESPONSE, VIEWPORTS } from './flows.const';
import { createEvent, createLesson, readJson } from './flows.utils';
import type { TestLesson } from './flows.types';

test('NAV-01 NAV-02: корень школы и список сохраняют выбор школы', async ({ actors }) => {
  const { page } = await actors('teacher');
  await page.goto(SCHOOL_PATH);
  await expect(page).toHaveURL(`${SCHOOL_PATH}/today`);
  await page.goto('/app/schools');
  await expect(page.getByRole('heading', { name: 'Мои школы', exact: true }).last()).toBeVisible();
  await page.getByTestId(`school-open-${OTHER_SCHOOL_ID}`).click();
  await expect(page).toHaveURL(`${OTHER_SCHOOL_PATH}/today`);
  await page.goto('/app');
  await expect(page).toHaveURL(`${OTHER_SCHOOL_PATH}/today`);
  await page.reload();
  await expect(page).toHaveURL(`${OTHER_SCHOOL_PATH}/today`);
});

test('NAV-03 ACCESS-02: Teacher в A становится Student в B без прежних действий', async ({ actors }) => {
  const { page } = await actors('teacher');
  await page.goto(`${SCHOOL_PATH}/lessons`);
  await expect(page.getByRole('button', { name: 'Создать урок', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /CI School/ }).first().click();
  await page.getByRole('menuitem', { name: /CI Other School/ }).click();
  await expect(page).toHaveURL(`${OTHER_SCHOOL_PATH}/today`);
  await page.goto(`${OTHER_SCHOOL_PATH}/lessons`);
  await expect(page.getByRole('button', { name: 'Создать урок', exact: true })).toHaveCount(0);
  await page.goto(`${OTHER_SCHOOL_PATH}/students`);
  await expect(page).toHaveURL(`${OTHER_SCHOOL_PATH}/today`);
});

test('NAV-04 ONB-01: новый аккаунт без школ может начать подключение', async ({ actors }) => {
  const { page } = await actors('new');
  await page.goto('/app');
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByLabel('Название школы')).toBeVisible();
  await expect(page.getByLabel('Код приглашения')).toHaveCount(0);
  await expect(page.getByTestId('onboarding-invite-link')).toBeVisible();
  await expect(page.getByTestId('onboarding-join-submit')).toBeEnabled();
  await page.goto('/app/schools');
  await page.getByTestId('school-add').click();
  await expect(page).toHaveURL(/\/onboarding$/);
});

for (const [path, label] of [['today', 'Сегодня'], ['lessons', 'Уроки'], ['courses', 'Курсы'], ['schedule', 'Расписание'], ['chats', 'Чаты'], ['files', 'Материалы'], ['students', 'Ученики']]) {
  test(`NAV-05 COMMON-01: раздел ${label} доступен из навигации`, async ({ actors }) => {
    const { page } = await actors();
    await page.goto(`${SCHOOL_PATH}/today`);
    await page.getByTestId(`nav-desktop-${path}`).click();
    await expect(page).toHaveURL(`${SCHOOL_PATH}/${path}`);
    await expect(page.getByRole('main').first()).toBeVisible();
  });
}

for (const [oldPath, newPath] of [
  ['/admin', `${SCHOOL_PATH}/today`], ['/profile', '/app/profile'], ['/Lessons', `${SCHOOL_PATH}/today`],
  ['/Lessons/1', `${SCHOOL_PATH}/today`], [`/admin/schools/${SCHOOL_ID}`, `${SCHOOL_PATH}/today`],
  [`/admin/schools/${SCHOOL_ID}/lessons`, `${SCHOOL_PATH}/lessons`],
  [`/admin/schools/${SCHOOL_ID}/calls`, `${SCHOOL_PATH}/schedule`],
  [`/admin/schools/${SCHOOL_ID}/settings`, `${SCHOOL_PATH}/today`],
]) {
  test(`NAV-07: старый адрес ${oldPath} ведёт в канонический раздел`, async ({ actors }) => {
    const { page } = await actors();
    await page.goto(oldPath);
    await expect(page).toHaveURL(newPath);
  });
}

test('NAV-09 CHAT-06: из ученика открывается его личный диалог', async ({ actors }) => {
  const { page } = await actors('teacher');
  await page.goto(`${SCHOOL_PATH}/students`);
  const row = page.getByRole('row').filter({ has: page.getByText('ci-student', { exact: true }) });
  await row.getByRole('button', { name: 'Написать', exact: true }).click();
  await expect(page).toHaveURL(`${SCHOOL_PATH}/chats`);
  await expect(page.getByTestId('chat-message-input')).toBeEnabled();
  await expect(page.getByText('ci-student', { exact: true }).last()).toBeVisible();
});

test('ACCESS-01 INV-13 FILE-10: реальная чужая школа и её ресурсы закрыты', async ({ actors }) => {
  const { page } = await actors('student');
  for (const path of ['lessons', 'files', 'chats', 'students', 'schedule']) {
    await page.goto(`${OTHER_SCHOOL_PATH}/${path}`);
    await expect(page).toHaveURL(/\/app\/schools$/);
  }
  for (const endpoint of [`/api/ApiLessons/${OTHER_SCHOOL_ID}/all`, `/api/ApiFiles/${OTHER_SCHOOL_ID}`, `/api/ApiSchedule/${OTHER_SCHOOL_ID}/events`, `/api/ApiAuth/invites/${OTHER_SCHOOL_ID}`]) {
    expect(HTTP_DENIED).toContain((await page.request.get(endpoint)).status());
  }
});

test('ACCESS-03 DEV-04: ученик не может изменить защищённые сущности напрямую', async ({ actors }) => {
  const { page } = await actors('student');
  const requests = [
    page.request.post(`/api/ApiLessons/${SCHOOL_ID}`, { data: { title: 'Запрещённый урок' } }),
    page.request.post(`/api/ApiSchedule/${SCHOOL_ID}/events`, { data: { title: 'Запрещённое занятие', startUtc: new Date().toISOString(), endUtc: new Date().toISOString() } }),
    page.request.post('/api/ApiAuth/invite', { data: { schoolPublicId: SCHOOL_ID, role: 0, maxUses: 1, expiresInMinutes: 60 } }),
    page.request.get('/api/ApiSchool/provisioning-requests'),
  ];
  for (const response of await Promise.all(requests)) expect(HTTP_DENIED).toContain(response.status());
  await page.goto('/developer');
  await expect(page.getByText('Войдите как администратор, чтобы просмотреть заявки.').first()).toBeVisible();
});

test('NAV-04 COMMON-02: ошибка школ восстанавливается явным повтором', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.route('**/api/ApiSchool/my-schools', route => route.fulfill(ERROR_RESPONSE));
  await page.goto('/app');
  await expect(page.getByText('Не удалось загрузить список школ.')).toBeVisible();
  await page.unroute('**/api/ApiSchool/my-schools');
  await page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await expect(page).toHaveURL(`${SCHOOL_PATH}/today`);
});

test('TODAY-01 TODAY-03 PROFILE-02: ближайшее занятие и недавний урок открываются по ID', async ({ actors }) => {
  const actor = await actors();
  await createLesson(actor);
  const event = await createEvent(actor);
  await actor.page.goto(`${SCHOOL_PATH}/today`);
  await expect(actor.page.getByRole('heading', { name: event.title, exact: true })).toBeVisible();
  const lessons = await readJson<TestLesson[]>(await actor.page.request.get(`/api/ApiLessons/${SCHOOL_ID}/all`));
  const recent = actor.page.getByTestId(/^today-lesson-\d+$/).first();
  await expect(recent).toBeVisible();
  const lessonId = (await recent.getAttribute('data-testid'))!.slice('today-lesson-'.length);
  const lesson = lessons.find(item => String(item.id) === lessonId);
  expect(lesson).toBeTruthy();
  await expect(recent).toContainText(lesson!.title);
  await recent.click();
  await expect(actor.page).toHaveURL(url => url.pathname === `${SCHOOL_PATH}/lessons/${lessonId}`);
  await actor.page.goto('/app/profile');
  await actor.page.getByRole('button', { name: 'Открыть в календаре', exact: true }).click();
  await expect(actor.page).toHaveURL(new RegExp(`eventId=${event.id}`));
  await expect(actor.page.getByRole('dialog')).toContainText(event.title);
});

test('TODAY-02 PROFILE-03: пустая школа не показывает выдуманные занятия', async ({ actors }) => {
  const { page } = await actors('outsider');
  await page.goto(`${OTHER_SCHOOL_PATH}/today`);
  await expect(page.getByText('Ближайших занятий пока нет.')).toBeVisible();
  await expect(page.getByText('На сегодня занятий нет.')).toBeVisible();
  await expect(page.getByText('Уроки ещё не добавлены.')).toBeVisible();
});

for (const role of ['owner', 'teacher', 'student']) {
  test(`TODAY-04 PROFILE-01: сводка и профиль соответствуют роли ${role}`, async ({ actors }) => {
    const { page, identity } = await actors(role);
    await page.goto(`${SCHOOL_PATH}/today`);
    await expect(page.getByRole('heading', { name: 'Школа', exact: true })).toHaveCount(role === 'owner' ? 1 : 0);
    await expect(page.getByRole('button', { name: 'Создать урок', exact: true })).toHaveCount(role === 'student' ? 0 : 1);
    await page.getByTestId('profile-open').click();
    await expect(page).toHaveURL(/\/app\/profile$/);
    await expect(page.getByRole('main').first().getByText(identity.userName, { exact: true })).toBeVisible();
    const schools = await readJson<Array<{ schoolName: string }>>(await page.request.get('/api/ApiSchool/my-schools'));
    for (const school of schools) await expect(page.getByRole('main').first().getByText(school.schoolName, { exact: true })).toBeVisible();
  });
}

for (const viewport of VIEWPORTS) {
  test(`NAV-06 COMMON-07: навигация и профиль на ширине ${viewport.width}`, async ({ actors }) => {
    const { page } = await actors('teacher', { viewport });
    await page.goto(`${SCHOOL_PATH}/today`);
    if (viewport.width < VIEWPORTS[0].width) {
      await page.getByTestId('nav-mobile-more').click();
      await page.getByTestId('nav-more-files').click();
      await expect(page).toHaveURL(`${SCHOOL_PATH}/files`);
    }
    await page.getByTestId('profile-open').click();
    await expect(page).toHaveURL(/\/app\/profile$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('TODAY-05: ошибка расписания отделена от остальных блоков и исчезает после восстановления', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.route(`**/api/ApiSchedule/${SCHOOL_ID}/events`, route => route.fulfill(ERROR_RESPONSE));
  await page.goto(`${SCHOOL_PATH}/today`);
  await expect(page.getByRole('alert').filter({ hasText: /заняти|расписани/ }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Последние уроки', exact: true })).toBeVisible();
  await page.unroute(`**/api/ApiSchedule/${SCHOOL_ID}/events`);
  await page.reload();
  await expect(page.getByRole('alert').filter({ hasText: /заняти|расписани/ })).toHaveCount(0);
});

test('LESSON-01 FILE-01 SCHEDULE-01: пустые разделы реальной второй школы', async ({ actors }) => {
  const { page } = await actors('outsider');
  await page.goto(`${OTHER_SCHOOL_PATH}/lessons`);
  await expect(page.getByRole('heading', { name: 'Мои уроки', exact: true })).toBeVisible();
  await expect(page.getByTestId(/^lesson-\d+$/)).toHaveCount(0);
  await page.goto(`${OTHER_SCHOOL_PATH}/files`);
  await expect(page.getByText('Файлы не найдены', { exact: true })).toBeVisible();
  await page.goto(`${OTHER_SCHOOL_PATH}/schedule`);
  await page.getByRole('button', { name: 'События', exact: true }).click();
  await expect(page.getByText('На этот день занятий нет.', { exact: true })).toBeVisible();
});
