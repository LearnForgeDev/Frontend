import { expect } from '@playwright/test';
import { SCHOOL_PATH } from './core.const';
import type { Actor } from './flows.types';

export async function openGroup(actor: Actor, name = 'Общий чат CI') {
  await actor.page.goto(`${SCHOOL_PATH}/chats`);
  const group = actor.page.getByTestId(/^chat-branch-/).filter({ has: actor.page.getByText(name, { exact: true }) });
  await group.click();
  await expect(actor.page.getByTestId('chat-status')).toHaveText('На связи');
  return (await group.getAttribute('data-testid'))!.slice('chat-branch-'.length);
}

export async function openDirect(actor: Actor, recipient: Actor) {
  await actor.page.goto(`${SCHOOL_PATH}/chats`);
  await actor.page.getByRole('tab', { name: 'Личные', exact: true }).click();
  await actor.page.getByTestId('chat-create').click();
  const dialog = actor.page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Собеседник' }).fill(recipient.identity.userName);
  await actor.page.getByRole('option', { name: recipient.identity.userName, exact: true }).click();
  await dialog.getByTestId('chat-direct-submit').click();
  await expect(actor.page.getByTestId('chat-status')).toHaveText('На связи');
}
