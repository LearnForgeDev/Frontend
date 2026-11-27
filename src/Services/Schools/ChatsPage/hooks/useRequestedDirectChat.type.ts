import type { ChatThread } from '@/Services/Chat/Chat.type';

export type UseRequestedDirectChatOptions = {
  directThreads: ChatThread[];
  onOpenThread: (thread: ChatThread) => void;
};
