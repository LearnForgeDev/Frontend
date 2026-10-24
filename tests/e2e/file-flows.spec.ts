import { readFile } from 'node:fs/promises';
import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { uploadFile, uniqueName, readJson } from './flows.utils';
import { PNG_BYTES, ERROR_RESPONSE, MOBILE_USER_AGENT, HTTP_DENIED } from './flows.const';
import type { TestFile } from './flows.types';

test('FILE-05 FILE-07: поиск, фильтр, список и UI-скачивание сохраняют исходные байты', async ({ actors }) => {
  const actor = await actors();
  const name = uniqueName('Русский материал') + '.txt';
  const bytes = Buffer.from('Материал с кириллицей');
  const file = await uploadFile(actor, name, bytes);
  await actor.page.getByPlaceholder('Поиск файлов...').fill(name.toUpperCase());
  const card = actor.page.getByTestId(`file-${file.publicId}`);
  await expect(card).toBeVisible();
  await actor.page.getByRole('combobox', { name: 'Тип файла' }).click();
  await actor.page.getByRole('option', { name: 'Изображения', exact: true }).click();
  await expect(card).toHaveCount(0);
  await actor.page.getByRole('combobox', { name: 'Тип файла' }).click();
  await actor.page.getByRole('option', { name: 'Документы', exact: true }).click();
  await expect(card).toBeVisible();
  await actor.page.getByTestId('files-view-list').click();
  await expect(actor.page.getByRole('table', { name: 'Таблица файлов' })).toBeVisible();
  const downloadEvent = actor.page.waitForEvent('download');
  await card.getByTestId('file-download').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe(name);
  expect(await readFile((await download.path())!)).toEqual(bytes);
});

test('FILE-06: просмотр текста и изображения не смешивает содержимое', async ({ actors }) => {
  const actor = await actors();
  const text = await uploadFile(actor, uniqueName('Текст') + '.txt', Buffer.from('Текст предпросмотра'));
  const image = await uploadFile(actor, uniqueName('Картинка') + '.png', PNG_BYTES, 'image/png');
  await actor.page.getByTestId(`file-${text.publicId}`).getByTestId('file-preview').click();
  await expect(actor.page.getByRole('dialog')).toContainText('Текст предпросмотра');
  await actor.page.getByTestId('file-preview-close').click();
  await actor.page.getByTestId(`file-${image.publicId}`).getByTestId('file-preview').click();
  const preview = actor.page.getByRole('dialog').getByRole('img', { name: image.fileName, exact: true });
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(actor.page.getByRole('dialog')).not.toContainText('Текст предпросмотра');
});

test('FILE-06: неподдерживаемый формат объясняет возможность скачать файл', async ({ actors }) => {
  const actor = await actors();
  const file = await uploadFile(actor, uniqueName('Архив') + '.zip', Buffer.from('Данные тестового файла'), 'application/zip');
  await actor.page.getByTestId(`file-${file.publicId}`).getByTestId('file-preview').click();
  await expect(actor.page.getByRole('dialog')).toContainText('Предпросмотр этого формата недоступен.');
  await expect(actor.page.getByRole('dialog').getByRole('button', { name: 'Скачать', exact: true })).toBeEnabled();
});

test('FILE-08 FILE-12: удаление адресует ID, отмена сохраняет файл с одинаковым именем', async ({ actors }) => {
  const actor = await actors();
  const name = uniqueName('Одинаковое имя') + '.txt';
  const first = await uploadFile(actor, name, Buffer.from('Первый'));
  const second = await uploadFile(actor, name, Buffer.from('Второй'));
  const card = actor.page.getByTestId(`file-${first.publicId}`);
  await card.getByTestId('file-delete').click();
  await actor.page.getByTestId('file-delete-cancel').click();
  await expect(card).toBeVisible();
  await card.getByTestId('file-delete').click();
  const response = actor.page.waitForResponse(item => item.url().endsWith(`/ApiFiles/${SCHOOL_ID}/${first.publicId}`) && item.request().method() === 'DELETE');
  await actor.page.getByTestId('file-delete-confirm').click();
  expect((await response).ok()).toBe(true);
  await actor.page.reload();
  await expect(card).toHaveCount(0);
  await expect(actor.page.getByTestId(`file-${second.publicId}`)).toBeVisible();
  const remaining = await actor.page.request.get(`/api/ApiFiles/${SCHOOL_ID}/${second.publicId}/content`);
  expect(await remaining.text()).toBe('Второй');
});

test('FILE-03: несколько выбранных файлов завершаются независимо', async ({ actors }) => {
  const actor = await actors();
  const names = [uniqueName('Первый') + '.txt', uniqueName('Второй') + '.txt'];
  await actor.page.goto(`${SCHOOL_PATH}/files`);
  await actor.page.getByTestId('files-input').setInputFiles(names.map(name => ({ name, mimeType: 'text/plain', buffer: Buffer.from(name) })));
  for (const name of names) await expect(actor.page.getByTestId(/^file-[0-9a-f-]+$/).filter({ hasText: name })).toBeVisible();
  const files = await readJson<TestFile[]>(await actor.page.request.get(`/api/ApiFiles/${SCHOOL_ID}`));
  for (const name of names) {
    const file = files.find(item => item.fileName === name);
    expect(file).toBeTruthy();
    actor.cleanup.push(async () => { expect((await actor.page.request.delete(`/api/ApiFiles/${SCHOOL_ID}/${file!.publicId}`)).ok()).toBe(true); });
  }
});

test('FILE-03: drag-and-drop отправляет реальные байты в хранилище', async ({ actors }) => {
  const actor = await actors();
  const name = uniqueName('Перетаскивание') + '.txt';
  await actor.page.goto(`${SCHOOL_PATH}/files`);
  const dataTransfer = await actor.page.evaluateHandle(name => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['Текст перетаскивания'], name, { type: 'text/plain' }));
    return transfer;
  }, name);
  await actor.page.getByTestId('files-dropzone').dispatchEvent('drop', { dataTransfer });
  await expect(actor.page.getByTestId(/^file-[0-9a-f-]+$/).filter({ hasText: name })).toBeVisible();
  const files = await readJson<TestFile[]>(await actor.page.request.get(`/api/ApiFiles/${SCHOOL_ID}`));
  const file = files.find(item => item.fileName === name)!;
  expect(file).toBeTruthy();
  actor.cleanup.push(async () => { expect((await actor.page.request.delete(`/api/ApiFiles/${SCHOOL_ID}/${file.publicId}`)).ok()).toBe(true); });
  expect(await (await actor.page.request.get(`/api/ApiFiles/${SCHOOL_ID}/${file.publicId}/content`)).text()).toBe('Текст перетаскивания');
});

test('FILE-09: ошибка списка не выглядит пустым состоянием и восстанавливается после reload', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  const fileList = (url: URL) => url.pathname === `/api/ApiFiles/${SCHOOL_ID}`;
  await page.route(fileList, route => route.fulfill(ERROR_RESPONSE));
  await page.goto(`${SCHOOL_PATH}/files`);
  await expect(page.getByText('Не удалось получить список файлов школы. Проверьте соединение.')).toBeVisible();
  await expect(page.getByText('Файлы не найдены', { exact: true })).toHaveCount(0);
  await page.unroute(fileList);
  await page.reload();
  await expect(page.getByText('Не удалось получить список файлов школы. Проверьте соединение.')).toHaveCount(0);
  await expect(page.getByTestId('files-upload')).toBeVisible();
});

test('FILE-10: прямое содержимое файла закрыто постороннему', async ({ actors }) => {
  const owner = await actors();
  const outsider = await actors('outsider');
  const file = await uploadFile(owner);
  for (const path of [`/api/ApiFiles/${SCHOOL_ID}/${file.publicId}/content`, `/api/ApiFiles/${SCHOOL_ID}`]) {
    expect(HTTP_DENIED).toContain((await outsider.page.request.get(path)).status());
  }
});

test('FILE-11: мобильный capture-input использует обычный upload pipeline', async ({ actors }) => {
  const actor = await actors('teacher', { userAgent: MOBILE_USER_AGENT, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await actor.page.goto(`${SCHOOL_PATH}/files`);
  await expect(actor.page.getByTestId('files-camera')).toBeVisible();
  const name = uniqueName('Снимок') + '.png';
  await actor.page.getByTestId('files-camera-input').setInputFiles({ name, mimeType: 'image/png', buffer: PNG_BYTES });
  await expect(actor.page.getByTestId(/^file-[0-9a-f-]+$/).filter({ hasText: name })).toBeVisible();
  const files = await readJson<TestFile[]>(await actor.page.request.get(`/api/ApiFiles/${SCHOOL_ID}`));
  const file = files.find(item => item.fileName === name)!;
  expect(file).toBeTruthy();
  actor.cleanup.push(async () => { expect((await actor.page.request.delete(`/api/ApiFiles/${SCHOOL_ID}/${file.publicId}`)).ok()).toBe(true); });
});
