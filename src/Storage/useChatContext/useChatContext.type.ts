import type { ChatThread } from '@/Services/Chat/Chat.type.ts';

export interface ChatContextValue {
  activeThread: ChatThread | null;
  setActiveThread: (thread: ChatThread | null) => void;
  isMiniOpen: boolean;
  setMiniOpen: (open: boolean) => void;
}
