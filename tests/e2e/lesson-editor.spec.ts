import { test, expect } from './fixtures';
import { login } from './auth.utils';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { createEditableLesson, createLessonDocument } from './lesson-editor.utils';
import { INITIAL_LESSON_CONTENT, OFFLINE_LESSON_CONTENT, RENAMED_LESSON_TITLE, SAVED_LESSON_CONTENT } from './lesson-editor.const';

test('сохранение и переименование урока видны ученику в отдельном браузере', async ({ page, browser }) => {
  await login(page, 'teacher');
  const lesson = await createEditableLesson(page);
  const lessonPath = `${SCHOOL_PATH}/lessons/${lesson.id}`;
  await page.goto(`${lessonPath}?edit=true`);
  const editor = page.locator('.editor-input[contenteditable="true"]');
  await expect(editor).toContainText(INITIAL_LESSON_CONTENT);
  await editor.fill(SAVED_LESSON_CONTENT);
  const savedResponse = page.waitForResponse(response => response.request().method() === 'PUT' && response.url().endsWith(`/ApiLessons/${SCHOOL_ID}/${lesson.id}`));
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  expect((await savedResponse).ok()).toBe(true);
  await expect(page.getByRole('status').filter({ hasText: 'Сохранено на сервере' })).toBeVisible();
  await page.getByRole('button', { name: 'Переименовать', exact: true }).click();
  await page.getByLabel('Название урока', { exact: true }).fill(RENAMED_LESSON_TITLE);
  await page.getByRole('button', { name: 'Сохранить название', exact: true }).click();
  await expect(page.getByRole('heading', { name: RENAMED_LESSON_TITLE, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: RENAMED_LESSON_TITLE, exact: true })).toBeVisible();
  await expect(editor).toContainText(SAVED_LESSON_CONTENT);

  const studentContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const student = await studentContext.newPage();
    await login(student, 'student');
    await student.goto(`${lessonPath}?edit=true`);
    await expect(student.getByRole('heading', { name: RENAMED_LESSON_TITLE, exact: true })).toBeVisible();
    await expect(student.locator('.editor-input')).toContainText(SAVED_LESSON_CONTENT);
    await expect(student.locator('.editor-input[contenteditable="true"]')).toHaveCount(0);
    await expect(student.getByRole('button', { name: 'Сохранить', exact: true })).toHaveCount(0);
    const denied = await student.request.put(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`, { data: { title: 'Запрещённое изменение' } });
    expect(denied.status()).toBe(403);
  } finally {
    await studentContext.close();
  }
});

test('потеря сети сохраняет черновик и позволяет повторить публикацию', async ({ page, context }) => {
  await login(page, 'teacher');
  const lesson = await createEditableLesson(page);
  await page.goto(`${SCHOOL_PATH}/lessons/${lesson.id}?edit=true`);
  const editor = page.locator('.editor-input[contenteditable="true"]');
  await expect(editor).toContainText(INITIAL_LESSON_CONTENT);
  await editor.fill(OFFLINE_LESSON_CONTENT);
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Повторить сохранение' })).toBeVisible();
  await expect(editor).toContainText(OFFLINE_LESSON_CONTENT);
  await context.setOffline(false);
  const before = await page.request.get(`/api/ApiFiles/${SCHOOL_ID}/${lesson.lessonJsonFile.publicId}/content`);
  expect(await before.text()).toContain(INITIAL_LESSON_CONTENT);
  await expect(editor).toContainText(OFFLINE_LESSON_CONTENT);
  await page.reload();
  await expect(editor).toContainText(OFFLINE_LESSON_CONTENT);
  const savedResponse = page.waitForResponse(response => response.request().method() === 'PUT' && response.url().endsWith(`/ApiLessons/${SCHOOL_ID}/${lesson.id}`));
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  expect((await savedResponse).ok()).toBe(true);
  const after = await page.request.get(`/api/ApiFiles/${SCHOOL_ID}/${lesson.lessonJsonFile.publicId}/content`);
  expect(await after.text()).toContain(OFFLINE_LESSON_CONTENT);
});

test('общий файл двух уроков нельзя перезаписать через один из уроков', async ({ page }) => {
  await login(page, 'teacher');
  const lesson = await createEditableLesson(page);
  const other = await page.request.post(`/api/ApiLessons/${SCHOOL_ID}`, {
    data: { title: 'Другой урок с общим материалом', lessonJsonFilePublicId: lesson.lessonJsonFile.publicId },
  });
  expect(other.ok()).toBe(true);
  const changed = await page.request.put(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`, {
    data: { title: 'Название тоже не должно измениться', content: createLessonDocument(SAVED_LESSON_CONTENT), expectedStorageKey: lesson.lessonJsonFile.storageKey },
  });
  expect(changed.status()).toBe(409);
  const original = await page.request.get(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`);
  expect((await original.json()).title).toBe(lesson.title);
  const content = await page.request.get(`/api/ApiFiles/${SCHOOL_ID}/${lesson.lessonJsonFile.publicId}/content`);
  expect(await content.text()).toContain(INITIAL_LESSON_CONTENT);
});

test('старый черновик не затирает новое сохранение другого браузера', async ({ page, browser }) => {
  await login(page, 'teacher');
  const lesson = await createEditableLesson(page);
  await page.goto(`${SCHOOL_PATH}/lessons/${lesson.id}?edit=true`);
  const editor = page.locator('.editor-input[contenteditable="true"]');
  await expect(editor).toContainText(INITIAL_LESSON_CONTENT);
  await editor.fill(OFFLINE_LESSON_CONTENT);
  await expect(page.getByRole('status').filter({ hasText: 'Есть несохранённые изменения' })).toBeVisible();
  const otherContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const other = await otherContext.newPage();
    await login(other, 'teacher');
    const changed = await other.request.put(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`, {
      data: { title: lesson.title, content: createLessonDocument(SAVED_LESSON_CONTENT), expectedStorageKey: lesson.lessonJsonFile.storageKey },
    });
    expect(changed.ok()).toBe(true);
    const rejected = page.waitForResponse(response => response.request().method() === 'PUT' && response.url().endsWith(`/ApiLessons/${SCHOOL_ID}/${lesson.id}`));
    await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
    expect((await rejected).status()).toBe(409);
    await expect(page.getByRole('alert').filter({ hasText: 'Урок изменён на сервере' })).toBeVisible();
    await expect(editor).toContainText(OFFLINE_LESSON_CONTENT);
    await page.reload();
    await expect(editor).toContainText(OFFLINE_LESSON_CONTENT);
    await expect(page.getByRole('button', { name: 'Сохранить', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Загрузить версию с сервера' }).click();
    await expect(editor).toContainText(SAVED_LESSON_CONTENT);
    await expect(page.getByRole('button', { name: 'Сохранить', exact: true })).toBeEnabled();
  } finally {
    await otherContext.close();
  }
});

test('ошибка метаданных не открывает пустой редактор', async ({ page }) => {
  await login(page, 'teacher');
  await page.goto(`${SCHOOL_PATH}/lessons/9223372036854775806?edit=true`);
  await expect(page.getByRole('alert').filter({ hasText: 'Не удалось открыть урок' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Повторить', exact: true })).toBeVisible();
  await expect(page.locator('.editor-input')).toHaveCount(0);
});

test('сервер отклоняет неправильный документ и сохраняет прежний материал', async ({ page, browser }) => {
  const teacher = await login(page, 'teacher');
  const lesson = await createEditableLesson(page, [teacher.userPublicId]);
  const invalid = await page.request.put(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`, { data: { title: 'Не должно сохраниться', content: {} } });
  expect(invalid.status()).toBe(400);
  const unchanged = await page.request.get(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`);
  expect((await unchanged.json()).title).toBe(lesson.title);
  const otherContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const owner = await otherContext.newPage();
    await login(owner, 'owner');
    const denied = await owner.request.put(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`, { data: { title: 'Чужой закрытый урок' } });
    expect(denied.status()).toBe(403);
  } finally {
    await otherContext.close();
  }
});
