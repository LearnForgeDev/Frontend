import type { ChatThread } from '@/Services/Chat/Chat.type';

export interface ActiveChatViewProps {
  activeThread: ChatThread;
  isMobile: boolean;
  onBack: () => void;
}
