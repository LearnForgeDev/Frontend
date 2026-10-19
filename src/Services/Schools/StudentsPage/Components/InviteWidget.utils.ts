import { AuthRole } from '@/Assets/Types/commonTypes';
import type { SchoolInvite } from '@/Endpoints/invites/types';

export function getInviteUrl(token: string) {
  return `${window.location.origin}/onboarding?invite=${encodeURIComponent(token)}`;
}

export function getInviteStatus(invite: SchoolInvite) {
  if (invite.revokedAt) return 'Удалена';
  if (Date.parse(invite.expiresAt) <= Date.now()) return 'Истекла';
  if (invite.usedCount >= invite.maxUses) return 'Лимит исчерпан';
  return 'Активна';
}

export function getInviteRole(role: AuthRole) {
  return role === AuthRole.TEACHER ? 'Преподаватель' : role === AuthRole.OWNER ? 'Владелец' : 'Ученик';
}

export function formatInviteDate(value: string) {
  return new Date(value).toLocaleString('ru-RU');
}

export function toLocalDateTime(value: string) {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
