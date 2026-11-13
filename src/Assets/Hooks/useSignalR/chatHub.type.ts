import type { ChatType } from '@/Services/Chat/Chat.type';

export interface ChatHubParams {
  type: ChatType;
  schoolPublicId: string;
  threadId: string; // branchId or otherUserId
}

export type ChatConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
