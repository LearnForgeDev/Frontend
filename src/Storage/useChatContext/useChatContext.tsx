import { ChatContext } from '@/Services/Chat/ChatContext.context';

export type { ChatContextValue } from './useChatContext.type';
import { useContext } from 'react';


export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
