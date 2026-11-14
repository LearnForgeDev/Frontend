import type { ChatThread } from '@/Services/Chat/Chat.type';

export interface UseCreateChatCallInviteParams {
  thread: ChatThread | null;
  sendMessage: (text: string, filePublicIds?: string[]) => Promise<void>;
}
