import { expect } from '@playwright/test';
import type { SchoolInvite } from '../../src/Endpoints/invites/types';
import { SCHOOL_ID } from './core.const';
import type { Actor } from './flows.types';
import { readJson } from './flows.utils';

export const inviteEndpoint = `/api/ApiAuth/invites/${SCHOOL_ID}`;

export async function readInvite(actor: Actor, id: number) {
  const invites = await readJson<SchoolInvite[]>(await actor.page.request.get(inviteEndpoint));
  const invite = invites.find(item => item.id === id);
  expect(invite).toBeTruthy();
  return invite!;
}

export async function createInvite(actor: Actor, maxUses = 5, role = 0) {
  const before = await readJson<SchoolInvite[]>(await actor.page.request.get(inviteEndpoint));
  const result = await readJson<{ inviteToken: string }>(await actor.page.request.post('/api/ApiAuth/invite', {
    data: { schoolPublicId: SCHOOL_ID, role, maxUses, expiresInMinutes: 60 },
  }));
  const after = await readJson<SchoolInvite[]>(await actor.page.request.get(inviteEndpoint));
  const invite = after.find(item => !before.some(previous => previous.id === item.id));
  expect(invite).toBeTruthy();
  actor.cleanup.push(async () => {
    const current = await readInvite(actor, invite!.id);
    if (!current.revokedAt) expect((await actor.page.request.delete(`${inviteEndpoint}/${current.id}`)).ok()).toBe(true);
  });
  return { ...invite!, token: result.inviteToken };
}

export async function acceptInvite(actor: Actor, token: string) {
  await actor.page.goto(`/onboarding?invite=${encodeURIComponent(token)}`);
  await actor.page.getByTestId('onboarding-join-submit').click();
  await expect(actor.page).toHaveURL(`/app/schools/${SCHOOL_ID}/today`);
}
