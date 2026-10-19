import { request, type APIRequestContext } from '@playwright/test';
import { test, expect } from './fixtures';
import { login } from './auth.utils';
import { CI_PASSWORD, SCHOOL_ID } from './core.const';

const baseURL = 'http://127.0.0.1:4173';
const invitesUrl = `/api/ApiAuth/invites/${SCHOOL_ID}`;

async function ownerContext() {
  const api = await request.newContext({ baseURL });
  const response = await api.post('/api/ApiAuth/login', { data: { name: 'ci-owner', password: CI_PASSWORD } });
  expect(response.ok(), await response.text()).toBe(true);
  return api;
}

async function newMember() {
  const api = await request.newContext({ baseURL });
  const name = `invite-${crypto.randomUUID()}`;
  const response = await api.post('/api/ApiAuth/reg', { data: { name, password: CI_PASSWORD, confirmPassword: CI_PASSWORD } });
  expect(response.ok(), await response.text()).toBe(true);
  return { api, name };
}

async function createInvite(api: APIRequestContext, maxUses = 1) {
  const response = await api.post('/api/ApiAuth/invite', {
    data: { schoolPublicId: SCHOOL_ID, role: 0, maxUses, expiresInMinutes: 60 },
  });
  expect(response.ok(), await response.text()).toBe(true);
  return (await response.json()).inviteToken as string;
}

async function findInvite(api: APIRequestContext, token: string) {
  const member = await newMember();
  try {
    const joined = await member.api.post('/api/ApiAuth/join-school', { data: { inviteToken: token } });
    expect(joined.ok(), await joined.text()).toBe(true);
    const list = await api.get(invitesUrl);
    expect(list.ok()).toBe(true);
    const invites = await list.json() as Array<{ id: number; usedCount: number; maxUses: number; uses: Array<{ userName: string }> }>;
    const invite = invites.find((item) => item.uses.some((use) => use.userName === member.name));
    expect(invite).toBeTruthy();
    return invite!;
  } finally { await member.api.dispose(); }
}

test('Ссылка сохраняет историю, меняет лимит, заменяется и удаляется', async () => {
  const owner = await ownerContext();
  const member = await newMember();
  try {
    const token = await createInvite(owner, 3);
    const invite = await findInvite(owner, token);
    expect(invite.usedCount).toBe(1);
    expect((await owner.put(`${invitesUrl}/${invite.id}`, { data: { maxUses: 0, expiresAt: new Date(Date.now() + 3_600_000).toISOString() } })).ok()).toBe(false);
    const edited = await owner.put(`${invitesUrl}/${invite.id}`, { data: { maxUses: 2, expiresAt: new Date(Date.now() + 3_600_000).toISOString() } });
    expect(edited.ok(), await edited.text()).toBe(true);
    const rotated = await owner.post(`${invitesUrl}/${invite.id}/rotate`);
    expect(rotated.ok()).toBe(true);
    const nextToken = (await rotated.json()).inviteToken;
    expect((await member.api.post('/api/ApiAuth/join-school', { data: { inviteToken: token } })).ok()).toBe(false);
    expect((await owner.delete(`${invitesUrl}/${invite.id}`)).ok()).toBe(true);
    expect((await member.api.post('/api/ApiAuth/join-school', { data: { inviteToken: nextToken } })).ok()).toBe(false);
    const list = await owner.get(invitesUrl);
    expect((await list.json()).find((item: { id: number }) => item.id === invite.id)).toMatchObject({ usedCount: 1, maxUses: 2, revokedAt: expect.any(String) });
    expect((await member.api.get(invitesUrl)).status()).toBe(403);
  } finally { await owner.dispose(); await member.api.dispose(); }
});

test('Последнее использование ссылки доступно одному участнику при одновременном вступлении', async () => {
  const owner = await ownerContext();
  const first = await newMember();
  const second = await newMember();
  try {
    const token = await createInvite(owner);
    const responses = await Promise.all([first, second].map((member) => member.api.post('/api/ApiAuth/join-school', { data: { inviteToken: token } })));
    expect(responses.filter((response) => response.ok())).toHaveLength(1);
    const list = await owner.get(invitesUrl);
    const items = await list.json() as Array<{ usedCount: number; uses: Array<{ userName: string }> }>;
    const invite = items.find((item) => item.uses.some((use) => [first.name, second.name].includes(use.userName)));
    expect(invite?.usedCount).toBe(1);
    expect(invite?.uses).toHaveLength(1);
  } finally { await owner.dispose(); await first.api.dispose(); await second.api.dispose(); }
});

test('Приглашение сохраняется при переходе с входа на регистрацию', async ({ page }) => {
  const owner = await ownerContext();
  const token = await createInvite(owner);
  await owner.dispose();
  await page.goto(`/onboarding?invite=${token}`);
  await expect(page).toHaveURL(/auth\/login/);
  await expect(page.getByLabel('Код приглашения')).toHaveCount(0);
  await page.getByRole('link', { name: 'Зарегистрироваться' }).click();
  await page.getByLabel(/^Имя пользователя/).fill(`invite-ui-${crypto.randomUUID()}`);
  await page.getByLabel(/^Пароль/).fill(CI_PASSWORD);
  await page.getByLabel(/^Подтвердите пароль/).fill(CI_PASSWORD);
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page).toHaveURL(`/onboarding?invite=${token}`);
  await page.getByRole('button', { name: 'Вступить в школу' }).click();
  await expect(page).toHaveURL(`/app/schools/${SCHOOL_ID}/today`);
});

test('Истёкшее приглашение можно продлить, преподаватель не управляет приглашением преподавателя', async () => {
  const owner = await ownerContext();
  const teacher = await request.newContext({ baseURL });
  const member = await newMember();
  try {
    expect((await teacher.post('/api/ApiAuth/login', { data: { name: 'ci-teacher', password: CI_PASSWORD } })).ok()).toBe(true);
    expect((await teacher.post('/api/ApiAuth/invite', { data: { schoolPublicId: SCHOOL_ID, role: 1, maxUses: 2, expiresInMinutes: 60 } })).status()).toBe(403);
    const response = await owner.post('/api/ApiAuth/invite', { data: { schoolPublicId: SCHOOL_ID, role: 1, maxUses: 2, expiresInMinutes: 60 } });
    expect(response.ok()).toBe(true);
    const token = (await response.json()).inviteToken;
    const invite = await findInvite(owner, token);
    expect((await teacher.delete(`${invitesUrl}/${invite.id}`)).status()).toBe(403);
    const expires = Date.now() + 2_000;
    expect((await owner.put(`${invitesUrl}/${invite.id}`, { data: { maxUses: 2, expiresAt: new Date(expires).toISOString() } })).ok()).toBe(true);
    await expect.poll(() => Date.now()).toBeGreaterThanOrEqual(expires);
    expect((await member.api.post('/api/ApiAuth/join-school', { data: { inviteToken: token } })).ok()).toBe(false);
    expect((await owner.put(`${invitesUrl}/${invite.id}`, { data: { maxUses: 2, expiresAt: new Date(Date.now() + 3_600_000).toISOString() } })).ok()).toBe(true);
    expect((await member.api.post('/api/ApiAuth/join-school', { data: { inviteToken: token } })).ok()).toBe(true);
  } finally { await owner.dispose(); await teacher.dispose(); await member.api.dispose(); }
});

test('Управление приглашениями открывается в школе', async ({ page }) => {
  await login(page);
  await page.goto(`/app/schools/${SCHOOL_ID}/students`);
  await expect(page.getByRole('heading', { name: 'Приглашения', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Пригласить в школу' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Лимит использований').fill('5');
  await dialog.getByLabel('Срок, часов').fill('2');
  await page.getByRole('button', { name: 'Создать приглашение' }).click();
  await expect(page.getByText('Приглашение готово', { exact: true })).toBeVisible();
  await expect(page.getByText(/http.*onboarding\?invite=/)).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Использовано 0 из 5', { exact: true })).toBeVisible();
  await test.info().attach('Управление приглашениями', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
