import { test, expect } from './fixtures';
import { SCHOOL_PATH } from './core.const';
import { HOUR_MS, ERROR_RESPONSE } from './flows.const';
import { createInvite, readInvite, acceptInvite, inviteEndpoint } from './invite-flows.utils';
import { readJson } from './flows.utils';

test('INV-03 INV-08 JOURNEY-02: вступление по ссылке появляется в истории и учениках', async ({ actors }) => {
  const owner = await actors();
  const member = await actors('new');
  const invite = await createInvite(owner);
  await acceptInvite(member, invite.token);
  await member.page.reload();
  await expect(member.page).toHaveURL(`${SCHOOL_PATH}/today`);
  const saved = await readInvite(owner, invite.id);
  expect(saved.usedCount).toBe(1);
  expect(saved.uses).toEqual([expect.objectContaining({ userName: member.identity.userName, userPublicId: member.identity.userPublicId, joinedAt: expect.any(String) })]);
  await owner.page.goto(`${SCHOOL_PATH}/students`);
  const card = owner.page.getByTestId(`invite-${invite.id}`);
  await card.locator('summary').click();
  await expect(card.getByText(member.identity.userName, { exact: true })).toBeVisible();
  const row = owner.page.getByRole('row').filter({ has: owner.page.getByText(member.identity.userName, { exact: true }) });
  await row.getByRole('button', { name: 'Написать', exact: true }).click();
  await expect(owner.page.getByTestId('chat-message-input')).toBeEnabled();
});

test('INV-09: UI сохраняет лимит и срок с прежней историей', async ({ actors }) => {
  const owner = await actors();
  const member = await actors('new');
  const invite = await createInvite(owner);
  await acceptInvite(member, invite.token);
  await owner.page.goto(`${SCHOOL_PATH}/students`);
  const card = owner.page.getByTestId(`invite-${invite.id}`);
  await card.getByLabel('Лимит использований').fill('0');
  await card.getByTestId('invite-save').click();
  expect(await card.getByLabel('Лимит использований').evaluate(input => (input as HTMLInputElement).validity.valid)).toBe(false);
  expect((await readInvite(owner, invite.id)).maxUses).toBe(invite.maxUses);
  await card.getByLabel('Лимит использований').fill('7');
  const expires = await owner.page.evaluate(timestamp => {
    const date = new Date(timestamp);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, Date.now() + HOUR_MS * 2);
  await card.getByLabel('Действует до').fill(expires);
  const response = owner.page.waitForResponse(item => new URL(item.url()).pathname === `${inviteEndpoint}/${invite.id}` && item.request().method() === 'PUT');
  await card.getByTestId('invite-save').click();
  expect((await response).ok()).toBe(true);
  await owner.page.reload();
  await expect(owner.page.getByTestId(`invite-${invite.id}`)).toContainText('Использовано 1 из 7');
  const saved = await readInvite(owner, invite.id);
  expect(saved.uses[0].userPublicId).toBe(member.identity.userPublicId);
  expect(new Date(saved.expiresAt).getTime()).toBeGreaterThan(new Date(invite.expiresAt).getTime());
});

test('INV-10: замена требует подтверждения, сохраняет историю и отключает старую ссылку', async ({ actors }) => {
  const owner = await actors('owner', { permissions: ['clipboard-read', 'clipboard-write'] });
  const member = await actors('new');
  const invite = await createInvite(owner);
  await owner.page.goto(`${SCHOOL_PATH}/students`);
  const card = owner.page.getByTestId(`invite-${invite.id}`);
  await card.getByTestId('invite-rotate').click();
  await owner.page.getByRole('dialog').getByRole('button', { name: 'Отмена' }).click();
  await acceptInvite(member, invite.token);
  await owner.page.reload();
  await card.getByTestId('invite-rotate').click();
  const rotated = owner.page.waitForResponse(item => item.url().endsWith(`/${invite.id}/rotate`) && item.request().method() === 'POST');
  await owner.page.getByRole('dialog').getByRole('button', { name: 'Подтвердить' }).click();
  const { inviteToken } = await (await rotated).json() as { inviteToken: string };
  await owner.page.getByRole('button', { name: 'Скопировать новую ссылку' }).click();
  const copied = await owner.page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(copied).searchParams.get('invite')).toBe(inviteToken);
  const nextMember = await actors('new');
  await nextMember.page.goto(`/onboarding?invite=${encodeURIComponent(invite.token)}`);
  await nextMember.page.getByTestId('onboarding-join-submit').click();
  await expect(nextMember.page.getByRole('alert')).toContainText('Не удалось вступить');
  await acceptInvite(nextMember, inviteToken);
  expect((await readInvite(owner, invite.id)).usedCount).toBe(2);
});

test('INV-07 INV-11: удаление сохраняет карточку и историю, но блокирует вступление', async ({ actors }) => {
  const owner = await actors();
  const member = await actors('new');
  const invite = await createInvite(owner);
  await owner.page.goto(`${SCHOOL_PATH}/students`);
  const card = owner.page.getByTestId(`invite-${invite.id}`);
  await card.getByTestId('invite-revoke').click();
  await owner.page.getByRole('dialog').getByRole('button', { name: 'Отмена' }).click();
  await acceptInvite(member, invite.token);
  await owner.page.reload();
  await card.getByTestId('invite-revoke').click();
  await owner.page.getByRole('dialog').getByRole('button', { name: 'Подтвердить' }).click();
  await expect(card.getByText('Удалена', { exact: true })).toBeVisible();
  await owner.page.reload();
  await card.locator('summary').click();
  await expect(card.getByText(member.identity.userName, { exact: true })).toBeVisible();
  const refused = await actors('new');
  await refused.page.goto(`/onboarding?invite=${encodeURIComponent(invite.token)}`);
  await refused.page.getByTestId('onboarding-join-submit').click();
  await expect(refused.page.getByRole('alert')).toContainText('Не удалось вступить');
  expect((await readInvite(owner, invite.id)).usedCount).toBe(1);
});

test('INV-12: преподаватель не меняет приглашение преподавателя, ученик не читает управление', async ({ actors }) => {
  const owner = await actors();
  const teacher = await actors('teacher');
  const student = await actors('student');
  const invite = await createInvite(owner, 5, 1);
  const path = `${inviteEndpoint}/${invite.id}`;
  for (const response of await Promise.all([
    teacher.page.request.put(path, { data: { maxUses: 6, expiresAt: new Date(Date.now() + HOUR_MS).toISOString() } }),
    teacher.page.request.post(`${path}/rotate`), teacher.page.request.delete(path), student.page.request.get(inviteEndpoint),
  ])) expect(response.status()).toBe(403);
  expect((await readInvite(owner, invite.id)).revokedAt).toBeNull();
});

test('INV-07 COMMON-02: список приглашений восстанавливается после ошибки чтения', { tag: '@ui-errors' }, async ({ actors }) => {
  const { page } = await actors();
  await page.route(`**${inviteEndpoint}`, route => route.fulfill(ERROR_RESPONSE));
  await page.goto(`${SCHOOL_PATH}/students`);
  await expect(page.getByText(/Не удалось загрузить приглашения/)).toBeVisible();
  await page.unroute(`**${inviteEndpoint}`);
  await page.getByRole('alert').filter({ hasText: 'Не удалось загрузить приглашения' }).getByRole('button', { name: 'Повторить' }).click();
  await expect(page.getByText(/Не удалось загрузить приглашения/)).toHaveCount(0);
  expect(Array.isArray(await readJson(await page.request.get(inviteEndpoint)))).toBe(true);
});

test('INV-02: невалидные лимиты формы не создают приглашение', async ({ actors }) => {
  const owner = await actors();
  await owner.page.goto(`${SCHOOL_PATH}/students`);
  await owner.page.getByTestId('invite-open').click();
  const dialog = owner.page.getByRole('dialog');
  const before = await readJson<unknown[]>(await owner.page.request.get(inviteEndpoint));
  await dialog.getByLabel('Лимит использований').fill('0');
  await dialog.getByTestId('invite-create').click();
  expect(await dialog.getByLabel('Лимит использований').evaluate(input => (input as HTMLInputElement).validity.valid)).toBe(false);
  expect((await readJson<unknown[]>(await owner.page.request.get(inviteEndpoint))).length).toBe(before.length);
  await dialog.getByLabel('Лимит использований').fill('1');
  await dialog.getByLabel('Срок, часов').fill('0');
  await dialog.getByTestId('invite-create').click();
  expect(await dialog.getByLabel('Срок, часов').evaluate(input => (input as HTMLInputElement).validity.valid)).toBe(false);
  await expect(dialog.getByText('Приглашение готово', { exact: true })).toHaveCount(0);
});
