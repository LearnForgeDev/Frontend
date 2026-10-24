import { readFile } from 'node:fs/promises';
import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { openGroup, openDirect } from './chat-flows.utils';
import { readJson, uniqueName, uploadFile } from './flows.utils';
import { PNG_BYTES, ERROR_RESPONSE } from './flows.const';

test('CHAT-01 CHAT-02: два участника получают сообщение группы и историю после reload', async ({ actors }) => {
  const sender = await actors('teacher');
  const recipient = await actors('student');
  await openGroup(sender);
  await openGroup(recipient);
  const message = uniqueName('Сообщение двум участникам');
  await sender.page.getByTestId('chat-message-input').fill(message);
  await sender.page.getByTestId('chat-send').click();
  await expect(sender.page.getByText(message, { exact: true })).toHaveCount(1);
  await expect(recipient.page.getByText(message, { exact: true })).toHaveCount(1);
  await openGroup(sender);
  await openGroup(recipient);
  await expect(sender.page.getByText(message, { exact: true })).toHaveCount(1);
  await expect(recipient.page.getByText(message, { exact: true })).toHaveCount(1);
});

test('CHAT-03: пробелы не отправляются без вложения', async ({ actors }) => {
  const actor = await actors('student');
  await openGroup(actor);
  await actor.page.getByTestId('chat-message-input').fill('   ');
  await expect(actor.page.getByTestId('chat-send')).toBeDisabled();
  await actor.page.getByTestId('chat-message-input').press('Enter');
  await expect(actor.page.getByTestId('chat-send')).toBeDisabled();
});

test('CHAT-04: создание группы через UI сохраняет название и историю', async ({ actors }) => {
  const actor = await actors('teacher');
  await actor.page.goto(`${SCHOOL_PATH}/chats`);
  await actor.page.getByTestId('chat-create').click();
  const dialog = actor.page.getByRole('dialog');
  await expect(dialog.getByTestId('chat-group-submit')).toBeDisabled();
  const title = uniqueName('Новая группа');
  await dialog.getByLabel('Название чата').fill(title);
  await dialog.getByLabel('Описание чата').fill('Обсуждение урока');
  const created = actor.page.waitForResponse(response => response.url().endsWith('/createBreanch') && response.request().method() === 'POST');
  await dialog.getByTestId('chat-group-submit').click();
  const response = await created;
  expect(response.ok()).toBe(true);
  const branchId = await response.json() as string;
  expect(branchId).toMatch(/^[0-9a-f-]{36}$/);
  actor.cleanup.push(async () => { expect((await actor.page.request.delete(`/api/ApiBreanches/${SCHOOL_ID}/${branchId}`)).ok()).toBe(true); });
  await expect(dialog).not.toBeVisible();
  await actor.page.getByTestId(`chat-branch-${branchId}`).click();
  await expect(actor.page.getByTestId('chat-status')).toHaveText('На связи');
  const message = uniqueName('История новой группы');
  await actor.page.getByTestId('chat-message-input').fill(message);
  await actor.page.getByTestId('chat-send').click();
  await expect(actor.page.getByText(message, { exact: true })).toBeVisible();
  await openGroup(actor, title);
  await expect(actor.page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await expect(actor.page.getByText(message, { exact: true })).toBeVisible();
});

test('CHAT-05 CHAT-10: direct-диалог доставляет сообщение и не дублирует собеседника', async ({ actors }) => {
  const sender = await actors('teacher');
  const recipient = await actors('student');
  await openDirect(sender, recipient);
  await openDirect(recipient, sender);
  const message = uniqueName('Личное сообщение');
  await sender.page.getByTestId('chat-message-input').fill(message);
  await sender.page.getByTestId('chat-message-input').press('Enter');
  await expect(recipient.page.getByText(message, { exact: true })).toBeVisible();
  await openDirect(sender, recipient);
  await expect(sender.page.getByText(message, { exact: true })).toBeVisible();
  await openGroup(sender);
  await expect(sender.page.getByText(message, { exact: true })).toHaveCount(0);
});

test('CHAT-07 CHAT-08 CHAT-09 JOURNEY-05: вложение доставляется, скачивается и сохраняется в истории', async ({ actors }) => {
  const sender = await actors('teacher');
  const recipient = await actors('student');
  const file = await uploadFile(sender);
  await openGroup(sender);
  await openGroup(recipient);
  await sender.page.getByTestId('chat-attach').click();
  const dialog = sender.page.getByRole('dialog');
  await dialog.getByPlaceholder('Поиск файлов...').fill(file.fileName);
  await dialog.getByText(file.fileName, { exact: true }).click();
  await dialog.getByTestId('chat-files-confirm').click();
  await sender.page.getByTestId('chat-send').click();
  await expect(recipient.page.getByText(file.fileName, { exact: true })).toBeVisible();
  const download = recipient.page.waitForEvent('download');
  await recipient.page.getByText(file.fileName, { exact: true }).click();
  const downloaded = await download;
  expect(downloaded.suggestedFilename()).toBe(file.fileName);
  expect(await readFile((await downloaded.path())!)).toEqual(Buffer.from('Содержимое материала'));
  await openGroup(recipient);
  await expect(recipient.page.getByText(file.fileName, { exact: true })).toBeVisible();
});

test('CHAT-09: изображение в сообщении открывается авторизованным получателем', async ({ actors }) => {
  const sender = await actors('teacher');
  const recipient = await actors('student');
  const file = await uploadFile(sender, uniqueName('Изображение чата') + '.png', PNG_BYTES, 'image/png');
  await openGroup(sender);
  await openGroup(recipient);
  await sender.page.getByTestId('chat-attach').click();
  const dialog = sender.page.getByRole('dialog');
  await dialog.getByPlaceholder('Поиск файлов...').fill(file.fileName);
  await dialog.getByText(file.fileName, { exact: true }).click();
  await dialog.getByTestId('chat-files-confirm').click();
  await sender.page.getByTestId('chat-send').click();
  const image = recipient.page.getByRole('img', { name: file.fileName, exact: true });
  await expect(image).toBeVisible();
  await image.click();
  await expect(recipient.page.getByRole('dialog').getByRole('img')).toBeVisible();
});

test('CHAT-08: отмена выбора не прикрепляет файлы к сообщению', async ({ actors }) => {
  const actor = await actors('teacher');
  const file = await uploadFile(actor);
  await openGroup(actor);
  await actor.page.getByTestId('chat-attach').click();
  const dialog = actor.page.getByRole('dialog');
  await dialog.getByPlaceholder('Поиск файлов...').fill(file.fileName);
  await dialog.getByText(file.fileName, { exact: true }).click();
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(actor.page.getByTestId('chat-send')).toBeDisabled();
});

test('CHAT-11 CALL-02: создание звонка из группы отправляет реальную ссылку второму участнику', async ({ actors }) => {
  const sender = await actors('teacher');
  const recipient = await actors('student');
  await openGroup(sender);
  await openGroup(recipient);
  const token = sender.page.waitForResponse(response => response.url().endsWith('/api/ApiMeet/token') && response.request().method() === 'POST');
  await sender.page.getByTestId('chat-call-create').click();
  const tokenResponse = await token;
  expect(tokenResponse.ok()).toBe(true);
  const room = tokenResponse.request().postDataJSON().room as string;
  expect(room).toBeTruthy();
  const join = recipient.page.getByTestId('chat-call-join').and(recipient.page.locator(`a[href*="room=${encodeURIComponent(room)}"]`));
  await expect(join).toBeVisible();
  const href = await join.getAttribute('href');
  expect(href).toContain(`${SCHOOL_PATH}/calls?`);
  expect(new URL(href!).searchParams.get('room')).toBe(room);
  await join.click();
  await expect(recipient.page).toHaveURL(href!);
});

test('CHAT-11: отказ токена не отправляет приглашение', { tag: '@ui-errors' }, async ({ actors }) => {
  const actor = await actors('teacher');
  const branchId = await openGroup(actor);
  const historyPath = `/api/ApiBreanches/${SCHOOL_ID}/${branchId}/history`;
  const historyBefore = await readJson<unknown[]>(await actor.page.request.get(historyPath));
  await actor.page.route('**/api/ApiMeet/token', route => route.fulfill(ERROR_RESPONSE));
  await actor.page.getByTestId('chat-call-create').click();
  await expect(actor.page.getByText('Попробуйте создать звонок позже.', { exact: true })).toBeVisible();
  await expect(actor.page.getByTestId('chat-call-create')).toBeEnabled();
  await openGroup(actor);
  expect(await readJson<unknown[]>(await actor.page.request.get(historyPath))).toEqual(historyBefore);
});

test('COMMON-08: HTML в сообщении остаётся текстом', async ({ actors }) => {
  const sender = await actors('teacher');
  const recipient = await actors('student');
  await openGroup(sender);
  await openGroup(recipient);
  const message = `<img src=x onerror="window.e2eInjection=true">${uniqueName('Разметка')}`;
  await sender.page.getByTestId('chat-message-input').fill(message);
  await sender.page.getByTestId('chat-message-input').press('Enter');
  await expect(recipient.page.getByText(message, { exact: true })).toBeVisible();
  expect(await recipient.page.evaluate(() => 'e2eInjection' in window)).toBe(false);
});
