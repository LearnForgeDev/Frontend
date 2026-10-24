import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { createLesson, openLessonEditor, saveLesson, uniqueName, readJson, uploadFile } from './flows.utils';
import { PNG_BYTES } from './flows.const';
import type { TestFile } from './flows.types';

test('SCHEDULE-04 COMMON-04: свободный слот задаёт дату и время, Escape закрывает форму', async ({ actors }) => {
  const { page } = await actors('teacher');
  await page.goto(`${SCHOOL_PATH}/schedule`);
  await page.getByRole('button', { name: 'День', exact: true }).click();
  const slot = page.getByTestId(/^schedule-slot-.*-10$/).first();
  const slotId = await slot.getAttribute('data-testid');
  expect(slotId).toBeTruthy();
  const [, , year, month, day] = slotId!.split('-');
  await slot.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Дата занятия')).toHaveValue(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  await expect(dialog.getByLabel('Время начала')).toHaveValue('10:00');
  await expect(dialog.getByLabel('Время окончания')).toHaveValue('11:00');
  await dialog.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('FILE-04: отмена передачи не создаёт файл, повторная загрузка работает', { tag: '@ui-errors' }, async ({ actors }) => {
  const actor = await actors();
  const name = uniqueName('Отменённый файл') + '.txt';
  let release!: () => void;
  let received!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const started = new Promise<void>(resolve => { received = resolve; });
  await actor.page.route('http://127.0.0.1:9000/**', async route => {
    if (route.request().method() !== 'PUT') return route.continue();
    received();
    await gate;
    await route.abort('aborted');
  });
  await actor.page.goto(`${SCHOOL_PATH}/files`);
  try {
    await actor.page.getByTestId('files-input').setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from('Отмена') });
    await started;
    await actor.page.getByTestId('upload-cancel').click();
    await expect(actor.page.getByText('Загрузка отменена', { exact: true })).toBeVisible();
  } finally {
    release();
    await actor.page.unrouteAll({ behavior: 'wait' });
  }
  const files = await readJson<TestFile[]>(await actor.page.request.get(`/api/ApiFiles/${SCHOOL_ID}`));
  expect(files.some(file => file.fileName === name)).toBe(false);
  await uploadFile(actor, name);
});

test('EDITOR-09: вставленное вложение сохраняется на сервере и читается учеником', async ({ actors }) => {
  const teacher = await actors('teacher');
  const student = await actors('student');
  const lesson = await createLesson(teacher);
  await openLessonEditor(teacher.page, lesson);
  await teacher.page.getByTestId('lesson-editor').click();
  await teacher.page.getByTestId('editor-insertFile').click();
  const name = uniqueName('Вложение урока') + '.txt';
  await teacher.page.getByRole('dialog').locator('input[type=file]').setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from('Материал внутри урока') });
  await expect(teacher.page.getByTestId('lesson-editor')).toContainText(name);
  await saveLesson(teacher.page, lesson);
  await student.page.goto(`${SCHOOL_PATH}/lessons/${lesson.id}`);
  await expect(student.page.getByTestId('lesson-editor')).toContainText(name);
  await expect(student.page.getByTestId('editor-save')).toHaveCount(0);
});

for (const kind of ['image', 'equation']) {
  test(`EDITOR-08 EDITOR-10: ${kind} сохраняется в документе и открывается ученику`, async ({ actors }) => {
    const teacher = await actors('teacher');
    const student = await actors('student');
    const lesson = await createLesson(teacher);
    await openLessonEditor(teacher.page, lesson);
    await teacher.page.getByTestId('lesson-editor').click();
    if (kind === 'image') {
      await teacher.page.getByTestId('editor-insertImage').click();
      await teacher.page.getByRole('dialog').locator('input[type=file]').setInputFiles({ name: 'Урок.png', mimeType: 'image/png', buffer: PNG_BYTES });
      await expect(teacher.page.getByTestId('lesson-editor').getByRole('img')).toBeVisible();
    } else {
      await teacher.page.getByTestId('editor-insertEquation').click();
      await teacher.page.getByRole('dialog').getByRole('textbox').fill('x^2+1');
      await teacher.page.getByRole('dialog').getByRole('button', { name: 'Вставить', exact: true }).click();
      await expect(teacher.page.getByTestId('lesson-editor').locator('.katex').first()).toBeVisible();
    }
    await saveLesson(teacher.page, lesson);
    await student.page.goto(`${SCHOOL_PATH}/lessons/${lesson.id}`);
    if (kind === 'image') {
      const image = student.page.getByTestId('lesson-editor').getByRole('img');
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    } else {
      await expect(student.page.getByTestId('lesson-editor').locator('.katex').first()).toBeVisible();
    }
  });
}

test('EDITOR-07: ссылка сохраняет адрес после публикации', async ({ actors }) => {
  const actor = await actors('teacher');
  const lesson = await createLesson(actor);
  await openLessonEditor(actor.page, lesson);
  const editor = actor.page.getByTestId('lesson-editor');
  await editor.fill('Ссылка на материал');
  await editor.press('ControlOrMeta+a');
  await actor.page.getByTestId('editor-formatInsertLink').click();
  await actor.page.getByTestId('editor-link-edit').click();
  await actor.page.getByTestId('editor-link-input').fill('https://example.test/material');
  await actor.page.getByTestId('editor-link-input').press('Enter');
  await expect(editor.getByRole('link')).toHaveAttribute('href', 'https://example.test/material');
  await saveLesson(actor.page, lesson);
  await actor.page.reload();
  await expect(editor.getByRole('link')).toHaveAttribute('href', 'https://example.test/material');
});
