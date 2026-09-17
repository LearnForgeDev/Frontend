import type { MemberDto } from '@/Endpoints/schools/types';
import {
  CALL_INVITE_LINK_LABEL,
  CALL_INVITE_MESSAGE_PREFIX,
} from './useBroadcastCallInvite.const';

export function createCallInviteUrl(schoolPublicId: string, room: string, title: string | null): string {
  const inviteSearchParams = new URLSearchParams({ room });

  if (title) {
    inviteSearchParams.set('title', title);
  }

  return `${window.location.origin}/app/schools/${schoolPublicId}/calls?${inviteSearchParams.toString()}`;
}

export function createCallInviteMessage(title: string | null, inviteUrl: string): string {
  const inviteTitle = title ? `${CALL_INVITE_MESSAGE_PREFIX}: ${title}` : CALL_INVITE_MESSAGE_PREFIX;

  return `${inviteTitle}\n${CALL_INVITE_LINK_LABEL}: ${inviteUrl}`;
}

export function getCallInviteRecipients(members: MemberDto[], currentUserPublicId?: string): MemberDto[] {
  return members.filter((member) => member.userPublicId && member.userPublicId !== currentUserPublicId);
}
