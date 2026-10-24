import { randomUUID } from 'node:crypto';
import { expect, type APIResponse, type Page } from '@playwright/test';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { EVENT_DURATION_MS, HOUR_MS } from './flows.const';
import { createEditableLesson } from './lesson-editor.utils';
import { INITIAL_LESSON_CONTENT } from './lesson-editor.const';
import type { Actor, TestEvent, TestFile, TestLesson } from './flows.types';

export function uniqueName(prefix: string) {
  return `${prefix} ${randomUUID()}`;
}

export async function readJson<T>(response: APIResponse): Promise<T> {
  expect(response.ok(), `${response.status()} ${response.url()}`).toBe(true);
  return response.json() as Promise<T>;
}

export async function createLesson(actor: Actor, title = uniqueName('Урок')) {
  const lesson = await createEditableLesson(actor.page, undefined, title) as TestLesson;
  actor.cleanup.push(async () => {
    const response = await actor.page.request.delete(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`);
    expect([200, 204, 404]).toContain(response.status());
  });
  return lesson;
}

export async function createEvent(actor: Actor, changes: Partial<TestEvent> = {}) {
  const now = Date.now();
  const members = await readJson<Array<{ userPublicId: string }>>(await actor.page.request.get(`/api/ApiSchool/${SCHOOL_ID}/members`));
  const { attendees, ...input } = changes;
  const event = await readJson<TestEvent>(await actor.page.request.post(`/api/ApiSchedule/${SCHOOL_ID}/events`, {
    data: {
      title: uniqueName('Занятие'), description: 'Описание занятия',
      startUtc: new Date(now + HOUR_MS).toISOString(), endUtc: new Date(now + HOUR_MS + EVENT_DURATION_MS).toISOString(),
      room: randomUUID(), attendeeUserPublicIds: attendees?.map(item => item.userPublicId) ?? members.map(item => item.userPublicId), ...input,
    },
  }));
  actor.cleanup.push(async () => {
    const response = await actor.page.request.delete(`/api/ApiSchedule/${SCHOOL_ID}/events/${event.id}`);
    expect([200, 204, 404]).toContain(response.status());
  });
  return event;
}

export async function readEvent(page: Page, id: string) {
  const events = await readJson<TestEvent[]>(await page.request.get(`/api/ApiSchedule/${SCHOOL_ID}/events`));
  const event = events.find(item => item.id === id);
  expect(event).toBeTruthy();
  return event!;
}

export async function uploadFile(actor: Actor, name = uniqueName('Материал') + '.txt', buffer = Buffer.from('Содержимое материала'), mimeType = 'text/plain') {
  await actor.page.goto(`${SCHOOL_PATH}/files`);
  const completed = actor.page.waitForResponse(response =>
    new URL(response.url()).pathname === `/api/ApiFiles/${SCHOOL_ID}/direct-upload/complete` && response.request().method() === 'POST');
  await actor.page.getByTestId('files-input').setInputFiles({ name, mimeType, buffer });
  const response = await completed;
  expect(response.ok()).toBe(true);
  const file = await response.json() as TestFile;
  expect(file.publicId).toBeTruthy();
  actor.cleanup.push(async () => {
    const response = await actor.page.request.delete(`/api/ApiFiles/${SCHOOL_ID}/${file.publicId}`);
    expect([200, 204, 404]).toContain(response.status());
  });
  await expect(actor.page.getByTestId(`file-${file.publicId}`)).toBeVisible();
  return file;
}

export async function openEvent(page: Page, id: string) {
  await page.goto(`${SCHOOL_PATH}/schedule?eventId=${encodeURIComponent(id)}`);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function openLessonEditor(page: Page, lesson: TestLesson) {
  const content = page.waitForResponse(response => response.url().includes(`/ApiFiles/${SCHOOL_ID}/${lesson.lessonJsonFile!.publicId}/content`));
  await page.goto(`${SCHOOL_PATH}/lessons/${lesson.id}?edit=true`);
  expect((await content).ok()).toBe(true);
  await expect(page.getByTestId('lesson-editor')).toHaveAttribute('contenteditable', 'true');
  await expect(page.getByTestId('lesson-editor')).toContainText(INITIAL_LESSON_CONTENT);
}

export async function saveLesson(page: Page, lesson: TestLesson) {
  const saved = page.waitForResponse(response => response.url().endsWith(`/ApiLessons/${SCHOOL_ID}/${lesson.id}`) && response.request().method() === 'PUT');
  await page.getByTestId('editor-save').click();
  expect((await saved).ok()).toBe(true);
  await expect(page.getByRole('status').filter({ hasText: 'Сохранено на сервере' })).toBeVisible();
}
