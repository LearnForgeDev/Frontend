import { useEffect, useState, useCallback } from 'react';
import { useChatHubConnection, type ChatHubParams } from '@/Assets/Hooks/useSignalR/chatHub';
import type { ChatMessage } from '@/Services/Chat/Chat.types';
import { useGlobalContext } from '@/Storage/Context/useGlobalContext';

export function useChatMessages(params: ChatHubParams) {
  const { connection, status } = useChatHubConnection(params);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const currentUserName = useGlobalContext((s) => s.auth.user?.userName);

  // Clear messages when thread changes. 
  // No message persistence in this layer — messages are in-memory only per connection session.
  // Page refresh starts fresh.
  useEffect(() => {
    setMessages([]);
  }, [params.threadId, params.type]);

  useEffect(() => {
    if (!connection) return;

    const handler = (senderName: string, text: string) => {
      const isOwn = senderName === currentUserName;
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        senderName,
        text,
        receivedAt: new Date().toISOString(),
        isOwn,
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    connection.on('ReceiveMessage', handler);

    return () => {
      connection.off('ReceiveMessage', handler);
    };
  }, [connection, currentUserName]);

  const sendMessage = useCallback((text: string) => {
    if (!connection || status !== 'connected') return;

    if (params.type === 'branch') {
      connection.invoke('SendMessageToBreanch', params.schoolPublicId, params.threadId, text).catch(console.error);
    } else {
      connection.invoke('SendMessageToDirect', params.schoolPublicId, params.threadId, text).catch(console.error);
    }
  }, [connection, status, params]);

  return {
    messages,
    sendMessage,
    status,
    isConnecting: status === 'connecting' || status === 'reconnecting',
  };
}
