import type { ChatThread } from '@/Services/Chat/Chat.types';
import {
  CHAT_CALL_INVITE_LABEL,
  CHAT_CALL_INVITE_MESSAGE_PREFIX,
  CHAT_CALL_ROOM_PREFIX,
  CHAT_CALL_TITLE_PREFIX,
} from './useCreateChatCallInvite.const';

export function createChatCallRoomName(thread: ChatThread): string {
  return `${CHAT_CALL_ROOM_PREFIX}-${thread.id}-${crypto.randomUUID()}`;
}

export function createChatCallTitle(threadName: string): string {
  return `${CHAT_CALL_TITLE_PREFIX}: ${threadName}`;
}

export function createChatCallInviteUrl(schoolPublicId: string, room: string, title: string): string {
  const searchParams = new URLSearchParams({ room, title });

  return `${window.location.origin}/app/schools/${schoolPublicId}/calls?${searchParams.toString()}`;
}

export function createChatCallInviteMessage(title: string, inviteUrl: string): string {
  return `${CHAT_CALL_INVITE_MESSAGE_PREFIX}: ${title}\n${CHAT_CALL_INVITE_LABEL}: ${inviteUrl}`;
}
