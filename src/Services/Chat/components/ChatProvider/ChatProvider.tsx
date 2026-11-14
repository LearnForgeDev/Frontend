import { useState, type ReactNode } from 'react';

import type { ChatThread } from '@/Services/Chat/Chat.type.ts';

import { ChatContext } from '@/Services/Chat/ChatContext.context';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [isMiniOpen, setMiniOpen] = useState(false);

  return (
    <ChatContext.Provider value={{ activeThread, setActiveThread, isMiniOpen, setMiniOpen }}>
      {children}
    </ChatContext.Provider>
  );
}
