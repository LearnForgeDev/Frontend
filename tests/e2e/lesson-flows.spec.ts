import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { createLesson, uniqueName, openLessonEditor, saveLesson, readJson } from './flows.utils';
import { MOBILE_USER_AGENT, ERROR_RESPONSE } from './flows.const';

test('LESSON-03 EDITOR-01: карточка открывается клавиатурой, прямая ссылка читает урок', async ({ actors }) => {
  const actor = await actors('teacher');
  const lesson = await createLesson(actor);
  await actor.page.goto(`${SCHOOL_PATH}/lessons`);
  const card = actor.page.getByTestId(`lesson-${lesson.id}`);
  await card.focus();
  await card.press('Enter');
  await expect(actor.page).toHaveURL(url => url.pathname.endsWith(`/lessons/${lesson.id}`) && url.searchParams.get('edit') === 'true');
  await expect(actor.page.getByTestId('lesson-editor')).toHaveAttribute('contenteditable', 'true');
  await actor.page.goto(`${SCHOOL_PATH}/lessons/${lesson.id}`);
  await expect(actor.page.getByTestId('lesson-editor')).toHaveAttribute('contenteditable', 'false');
  await actor.page.getByTestId('lesson-back').click();
  await expect(actor.page).toHaveURL(url => url.pathname.replace(/\/$/, '') === `${SCHOOL_PATH}/lessons`);
});

test('LESSON-04: подтверждённое UI-удаление, отмена сохраняет урок', async ({ actors }) => {
  const actor = await actors('teacher');
  const lesson = await createLesson(actor);
  await actor.page.goto(`${SCHOOL_PATH}/lessons`);
  const card = actor.page.getByTestId(`lesson-${lesson.id}`);
  await card.getByTestId('lesson-options').click();
  await actor.page.getByTestId('lesson-delete').click();
  await actor.page.getByTestId('lesson-delete-cancel').click();
  await expect(card).toBeVisible();
  await card.getByTestId('lesson-options').click();
  await actor.page.getByTestId('lesson-delete').click();
  const deleted = actor.page.waitForResponse(response => response.url().endsWith(`/ApiLessons/${SCHOOL_ID}/${lesson.id}`) && response.request().method() === 'DELETE');
  await actor.page.getByTestId('lesson-delete-confirm').click();
  expect((await deleted).ok()).toBe(true);
  await actor.page.reload();
  await expect(card).toHaveCount(0);
});

test('LESSON-05: ошибка списка исправляется повтором без выхода', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.route(`**/api/ApiLessons/${SCHOOL_ID}/all`, route => route.fulfill(ERROR_RESPONSE));
  await page.goto(`${SCHOOL_PATH}/lessons`);
  await expect(page.getByText('Не удалось загрузить уроки.', { exact: true })).toBeVisible();
  await page.unroute(`**/api/ApiLessons/${SCHOOL_ID}/all`);
  await page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await expect(page.getByText('Не удалось загрузить уроки.', { exact: true })).toHaveCount(0);
});

test('LESSON-06 ACCESS-02: edit=true не даёт ученику редактор', async ({ actors }) => {
  const teacher = await actors('teacher');
  const student = await actors('student');
  const lesson = await createLesson(teacher);
  await student.page.goto(`${SCHOOL_PATH}/lessons/${lesson.id}?edit=true`);
  await expect(student.page.getByTestId('lesson-editor')).toHaveAttribute('contenteditable', 'false');
  await expect(student.page.getByTestId('editor-save')).toHaveCount(0);
  await expect(student.page.locator('.toolbar')).toHaveCount(0);
});

for (const auto of [false, true]) {
  test(`EDITOR-02 EDITOR-03: локальный черновик восстанавливается после ${auto ? 'автосохранения черновика' : 'публикации на сервере'}`, async ({ actors }) => {
    const actor = await actors('teacher');
    const lesson = await createLesson(actor);
    const text = uniqueName('Черновик');
    await openLessonEditor(actor.page, lesson);
    const editor = actor.page.getByTestId('lesson-editor');
    await expect(editor).toHaveAttribute('contenteditable', 'true');
    await editor.fill(text);
    if (auto) await expect(actor.page.getByRole('status').filter({ hasText: 'Есть несохранённые изменения' })).toBeVisible();
    else await saveLesson(actor.page, lesson);
    await actor.page.reload();
    await expect(editor).toContainText(text);
    const serverFile = await actor.page.request.get(`/api/ApiFiles/${SCHOOL_ID}/${lesson.lessonJsonFile!.publicId}/content`);
    if (auto) expect(await serverFile.text()).not.toContain(text);
    else expect(await serverFile.text()).toContain(text);
  });
}

for (const [format, tag] of [['Жирный', 'strong'], ['Курсив', 'em'], ['Подчеркнутый', 'u'], ['Зачеркнутый', 's'], ['Код', 'code']]) {
  test(`EDITOR-04: формат ${format} сохраняется в локальном черновике`, async ({ actors }) => {
    const actor = await actors('teacher');
    const lesson = await createLesson(actor);
    await openLessonEditor(actor.page, lesson);
    const editor = actor.page.getByTestId('lesson-editor');
    await editor.fill('Форматированный текст');
    await editor.press('ControlOrMeta+a');
    await actor.page.getByRole('button', { name: format, exact: true }).click();
    if (tag === 'u' || tag === 's') await expect(editor.locator(tag === 'u' ? '.editor-text-underline' : '.editor-text-strikethrough')).toHaveCount(1);
    else await expect(editor.locator(tag)).toHaveCount(1);
    await saveLesson(actor.page, lesson);
    await actor.page.reload();
    await expect(editor).toContainText('Форматированный текст');
  });
}

for (const [label, selector] of [['Заголовок 1', 'h1'], ['Заголовок 2', 'h2'], ['Цитата', 'blockquote'], ['Маркированный список', 'ul'], ['Нумерованный список', 'ol']]) {
  test(`EDITOR-05: блок ${label} меняет структуру документа`, async ({ actors }) => {
    const actor = await actors('teacher');
    const lesson = await createLesson(actor);
    await openLessonEditor(actor.page, lesson);
    const editor = actor.page.getByTestId('lesson-editor');
    await editor.fill('Структура документа');
    await editor.press('ControlOrMeta+a');
    if (!label.includes('список')) await actor.page.getByRole('button', { name: 'Обычный текст', exact: true }).click();
    await actor.page.getByRole('button', { name: label, exact: true }).click();
    await expect(editor.locator(selector)).toContainText('Структура документа');
  });
}

test('EDITOR-06: отмена и повтор возвращают состояние документа', async ({ actors }) => {
  const actor = await actors('teacher');
  const lesson = await createLesson(actor);
  await openLessonEditor(actor.page, lesson);
  const editor = actor.page.getByTestId('lesson-editor');
  await editor.pressSequentially('История изменения');
  await expect(actor.page.getByRole('button', { name: 'Отменить', exact: true })).toBeEnabled();
  await actor.page.getByRole('button', { name: 'Отменить', exact: true }).click();
  await expect(actor.page.getByRole('button', { name: 'Повторить', exact: true })).toBeEnabled();
  await actor.page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await expect(editor).toContainText('История изменения');
});

test('EDITOR-12: мобильный просмотр не включает редактирование', async ({ actors }) => {
  const actor = await actors('teacher', { userAgent: MOBILE_USER_AGENT, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const lesson = await createLesson(actor);
  await actor.page.goto(`${SCHOOL_PATH}/lessons/${lesson.id}?edit=true`);
  await expect(actor.page.getByTestId('lesson-editor')).toHaveAttribute('contenteditable', 'false');
  await expect(actor.page.getByTestId('editor-save')).toHaveCount(0);
  await expect(actor.page.locator('.toolbar')).toHaveCount(0);
});

test('COMMON-03 LESSON-02: повторное нажатие создания не дублирует урок', async ({ actors }) => {
  const actor = await actors();
  const before = await readJson<Array<{ id: string }>>(await actor.page.request.get(`/api/ApiLessons/${SCHOOL_ID}/all`));
  await actor.page.goto(`${SCHOOL_PATH}/lessons`);
  await actor.page.getByTestId('lesson-create').dblclick();
  await expect(actor.page).toHaveURL(url => url.pathname.startsWith(`${SCHOOL_PATH}/lessons/`) && url.searchParams.get('edit') === 'true');
  const after = await readJson<Array<{ id: string }>>(await actor.page.request.get(`/api/ApiLessons/${SCHOOL_ID}/all`));
  const created = after.filter(lesson => !before.some(previous => previous.id === lesson.id));
  for (const lesson of created) actor.cleanup.push(async () => { expect((await actor.page.request.delete(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`)).ok()).toBe(true); });
  expect(created).toHaveLength(1);
  await actor.page.reload();
  await expect(actor.page.getByTestId('lesson-editor')).toHaveAttribute('contenteditable', 'true');
});
