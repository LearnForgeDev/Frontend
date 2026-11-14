import { createContext } from 'react';
import type { ChatContextValue } from '@/Storage/useChatContext/useChatContext.type';

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);
