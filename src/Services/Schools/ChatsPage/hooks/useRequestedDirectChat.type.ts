import type { MemberDto } from '@/Endpoints/schools/schools.contract.type';
import type { ChatThread } from '@/Services/Chat/Chat.type';

export type UseRequestedDirectChatOptions = {
  members: MemberDto[];
  directThreads: ChatThread[];
  addDirectChat: (name: string, otherUserId: string) => ChatThread;
  onOpenThread: (thread: ChatThread) => void;
};
