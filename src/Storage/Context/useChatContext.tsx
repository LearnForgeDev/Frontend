import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ChatThread } from '@/Services/Chat/Chat.types';

export interface ChatContextValue {
  activeThread: ChatThread | null;
  setActiveThread: (thread: ChatThread | null) => void;
  isMiniOpen: boolean;
  setMiniOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [isMiniOpen, setMiniOpen] = useState(false);

  return (
    <ChatContext.Provider value={{ activeThread, setActiveThread, isMiniOpen, setMiniOpen }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
