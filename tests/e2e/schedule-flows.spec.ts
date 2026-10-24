import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { createEvent, openEvent, readEvent, uniqueName } from './flows.utils';
import { EVENT_DURATION_MS, HOUR_MS, MINUTE_MS, ERROR_RESPONSE } from './flows.const';
import { STUDENT_JOIN_WINDOW_MINUTES } from '../../src/Services/Scheduling/hooks/useJoinWindow/useJoinWindow.const';

test('SCHEDULE-02: виды календаря и переход к сегодняшней дате сохраняют события', async ({ actors }) => {
  const actor = await actors('teacher');
  const event = await createEvent(actor);
  await actor.page.clock.setFixedTime(new Date(event.startUtc));
  await actor.page.goto(`${SCHOOL_PATH}/schedule`);
  for (const view of ['День', 'Неделя', 'События']) {
    await actor.page.getByRole('button', { name: view, exact: true }).click();
    await expect(actor.page.getByText(event.title, { exact: true }).first()).toBeVisible();
  }
  await actor.page.getByRole('button', { name: 'День', exact: true }).click();
  await actor.page.getByTestId('schedule-next').click();
  await actor.page.getByTestId('schedule-previous').click();
  await actor.page.getByTestId('schedule-today').click();
  await expect(actor.page.getByText(event.title, { exact: true }).first()).toBeVisible();
});

test('SCHEDULE-05: неверный интервал и пустое название не сохраняются', async ({ actors }) => {
  const { page } = await actors('teacher');
  await page.goto(`${SCHOOL_PATH}/schedule`);
  await page.getByTestId('schedule-create').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByTestId('schedule-form-submit').click();
  await expect(dialog.getByText('Укажите название.', { exact: true })).toBeVisible();
  await dialog.getByTestId('schedule-form-title').fill(uniqueName('Невалидное занятие'));
  await dialog.getByTestId('schedule-form-start-time').fill('12:00');
  await dialog.getByTestId('schedule-form-end-time').fill('11:00');
  await dialog.getByTestId('schedule-form-submit').click();
  await expect(dialog.getByText('Время начала должно быть раньше времени окончания.')).toBeVisible();
  await dialog.getByTestId('schedule-form-cancel').click();
  await expect(dialog).not.toBeVisible();
});

test('SCHEDULE-06 COMMON-06: изменение занятия сохраняет комнату и участников', async ({ actors }) => {
  const actor = await actors('teacher');
  const event = await createEvent(actor);
  const title = uniqueName('Изменённое занятие');
  const dialog = await openEvent(actor.page, event.id);
  await dialog.getByTestId('schedule-event-edit').click();
  const form = actor.page.getByRole('dialog').filter({ hasText: 'Редактировать занятие' });
  await form.getByTestId('schedule-form-title').fill(title);
  await form.getByTestId('schedule-form-description').fill('Обновлённое описание');
  const saved = actor.page.waitForResponse(response => response.url().endsWith(`/events/${event.id}`) && response.request().method() === 'PATCH');
  await form.getByTestId('schedule-form-submit').click();
  expect((await saved).ok()).toBe(true);
  const result = await readEvent(actor.page, event.id);
  expect(result).toMatchObject({ title, description: 'Обновлённое описание', room: event.room, attendees: event.attendees });
  await actor.page.reload();
  await expect(actor.page.getByText(title, { exact: true }).first()).toBeVisible();
});

test('SCHEDULE-07: inline-название можно отменить и сохранить', async ({ actors }) => {
  const actor = await actors('teacher');
  const event = await createEvent(actor);
  const dialog = await openEvent(actor.page, event.id);
  await dialog.getByTestId('schedule-event-title').click();
  await dialog.getByTestId('schedule-event-title-input').fill('Отменённое изменение');
  await dialog.getByTestId('schedule-event-title-input').press('Escape');
  expect((await readEvent(actor.page, event.id)).title).toBe(event.title);
  await openEvent(actor.page, event.id);
  const title = uniqueName('Новое название');
  await dialog.getByTestId('schedule-event-title').click();
  await dialog.getByTestId('schedule-event-title-input').fill(title);
  const saved = actor.page.waitForResponse(response => response.url().endsWith(`/events/${event.id}`) && response.request().method() === 'PATCH');
  await dialog.getByTestId('schedule-event-title-input').press('Enter');
  expect((await saved).ok()).toBe(true);
  expect((await readEvent(actor.page, event.id)).title).toBe(title);
});

test('SCHEDULE-08: UI-удаление убирает событие на сервере', async ({ actors }) => {
  const actor = await actors('teacher');
  const event = await createEvent(actor);
  const dialog = await openEvent(actor.page, event.id);
  const deleted = actor.page.waitForResponse(response => response.url().endsWith(`/events/${event.id}`) && response.request().method() === 'DELETE');
  await dialog.getByTestId('schedule-event-delete').click();
  await actor.page.getByTestId('schedule-delete-cancel').click();
  expect((await readEvent(actor.page, event.id)).id).toBe(event.id);
  await openEvent(actor.page, event.id);
  await dialog.getByTestId('schedule-event-delete').click();
  await actor.page.getByTestId('schedule-delete-confirm').click();
  expect((await deleted).ok()).toBe(true);
  await expect(dialog).not.toBeVisible();
  await actor.page.reload();
  await expect(actor.page.getByText(event.title, { exact: true })).toHaveCount(0);
});

test('SCHEDULE-09 SCHEDULE-10: прямая ссылка открывает событие и правильный Google Calendar URL', async ({ actors }) => {
  const actor = await actors();
  const event = await createEvent(actor);
  const dialog = await openEvent(actor.page, event.id);
  const href = await dialog.getByTestId('schedule-google-calendar').getAttribute('href');
  expect(new URL(href!).searchParams.get('text')).toBe(event.title);
  await dialog.getByTestId('schedule-event-close').click();
  await expect(dialog).not.toBeVisible();
  await actor.page.goto(`${SCHOOL_PATH}/schedule?eventId=missing`);
  await expect(actor.page.getByTestId('schedule-create')).toBeVisible();
  await expect(actor.page.getByRole('dialog')).toHaveCount(0);
});

test('SCHEDULE-11: ученик видит событие без управления', async ({ actors }) => {
  const teacher = await actors('teacher');
  const student = await actors('student');
  const event = await createEvent(teacher, { attendees: [{ userPublicId: student.identity.userPublicId, displayName: student.identity.userName }] });
  const dialog = await openEvent(student.page, event.id);
  for (const id of ['schedule-event-edit', 'schedule-event-delete', 'schedule-start-now']) await expect(dialog.getByTestId(id)).toHaveCount(0);
  await expect(student.page.getByTestId('schedule-create')).toHaveCount(0);
  expect((await student.page.request.delete(`/api/ApiSchedule/${SCHOOL_ID}/events/${event.id}`)).status()).toBe(403);
});

test('SCHEDULE-12: ошибка изменения оставляет введённые значения', { tag: '@ui-errors' }, async ({ actors }) => {
  const actor = await actors('teacher');
  const event = await createEvent(actor);
  const dialog = await openEvent(actor.page, event.id);
  await dialog.getByTestId('schedule-event-edit').click();
  const form = actor.page.getByRole('dialog').filter({ hasText: 'Редактировать занятие' });
  const title = uniqueName('Черновик');
  await form.getByTestId('schedule-form-title').fill(title);
  await actor.page.route(`**/events/${event.id}`, route => route.request().method() === 'PATCH' ? route.fulfill(ERROR_RESPONSE) : route.continue());
  await form.getByTestId('schedule-form-submit').click();
  await expect(actor.page.getByText('Не удалось сохранить занятие. Попробуйте ещё раз.', { exact: true })).toBeVisible();
  await expect(form.getByTestId('schedule-form-title')).toHaveValue(title);
  await actor.page.unroute(`**/events/${event.id}`);
});

test('SCHEDULE-13 CALL-02: начать сейчас переносит интервал перед переходом в комнату', async ({ actors }) => {
  const actor = await actors('teacher');
  const event = await createEvent(actor);
  const dialog = await openEvent(actor.page, event.id);
  await dialog.getByTestId('schedule-start-now').click();
  let confirmation = actor.page.getByRole('dialog').filter({ hasText: 'Начать встречу сейчас?' });
  await confirmation.getByTestId('schedule-start-now-cancel').click();
  expect((await readEvent(actor.page, event.id)).startUtc).toBe(event.startUtc);
  await dialog.getByTestId('schedule-start-now').click();
  confirmation = actor.page.getByRole('dialog').filter({ hasText: 'Начать встречу сейчас?' });
  const saved = actor.page.waitForResponse(response => response.url().endsWith(`/events/${event.id}`) && response.request().method() === 'PATCH');
  await confirmation.getByTestId('schedule-start-now-confirm').click();
  expect((await saved).ok()).toBe(true);
  await expect(actor.page).toHaveURL(url => url.pathname === `${SCHOOL_PATH}/calls` && url.searchParams.get('room') === event.room);
  const result = await readEvent(actor.page, event.id);
  expect(result.room).toBe(event.room);
  expect(new Date(result.endUtc).getTime() - new Date(result.startUtc).getTime()).toBe(EVENT_DURATION_MS);
  expect(new Date(result.startUtc).getTime()).toBeLessThan(new Date(event.startUtc).getTime());
});

test('CALL-01: окно входа ученика меняется по часам без reload', async ({ actors }) => {
  const teacher = await actors('teacher');
  const student = await actors('student');
  const start = Date.now() + HOUR_MS;
  const event = await createEvent(teacher, { startUtc: new Date(start).toISOString(), endUtc: new Date(start + EVENT_DURATION_MS).toISOString() });
  await student.page.clock.install({ time: new Date(start - HOUR_MS) });
  const dialog = await openEvent(student.page, event.id);
  await expect(dialog.getByRole('button', { name: 'Скоро', exact: true })).toBeDisabled();
  await student.page.clock.fastForward(HOUR_MS - STUDENT_JOIN_WINDOW_MINUTES * MINUTE_MS + 100);
  await expect(dialog.getByTestId('schedule-join')).toBeEnabled();
  await student.page.clock.fastForward(STUDENT_JOIN_WINDOW_MINUTES * MINUTE_MS + EVENT_DURATION_MS);
  await expect(dialog.getByRole('button', { name: 'Завершено', exact: true })).toBeDisabled();
});

test('CALL-03: чужой пользователь не получает токен комнаты реальной школы', async ({ actors }) => {
  const { page } = await actors('outsider');
  const response = await page.request.post('/api/ApiMeet/token', { data: { schoolPublicId: SCHOOL_ID, room: 'foreign-school-room' } });
  expect(response.status()).toBe(403);
});

test('CALL-04: пустая комната и ошибка токена оставляют рабочую страницу', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.goto(`${SCHOOL_PATH}/calls?room=%20`);
  await expect(page.getByText('Звонок не выбран')).toBeVisible();
  await page.route('**/api/ApiMeet/token', route => route.fulfill(ERROR_RESPONSE));
  await page.goto(`${SCHOOL_PATH}/calls?room=unavailable`);
  await expect(page.getByText('Не удалось войти в звонок', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(page.getByText('Звонок не выбран')).toBeVisible();
});
