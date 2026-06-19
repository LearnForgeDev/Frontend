import { useEffect, useState, useCallback } from 'react';
import { useChatHubConnection, type ChatHubParams } from '@/Assets/Hooks/useSignalR/chatHub';
import type { ChatMessage } from '@/Services/Chat/Chat.types';
import { useGlobalContext } from '@/Storage/Context/useGlobalContext';

import { chatEndpoints } from '@/Endpoints/chat.endpoints';
import type { BranchMessageDto, DirectMessageDto } from '@/Services/Chat/Chat.types';

export function useChatMessages(params: ChatHubParams) {
  const { connection, status } = useChatHubConnection(params);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const currentUserName = useGlobalContext((s) => s.auth.user?.userName);

  useEffect(() => {
    let isMounted = true;
    setMessages([]);

    if (!params.threadId || !params.schoolPublicId) return;

    const currentUserPublicId = useGlobalContext.getState().auth.user?.userPublicId;

    if (params.type === 'branch') {
      chatEndpoints.getBranchHistory(params.schoolPublicId, parseInt(params.threadId, 10))
        .then((history: BranchMessageDto[]) => {
          if (!isMounted) return;
          setMessages(history.map(h => ({
            id: h.publicId,
            senderPublicId: h.senderPublicId,
            senderName: h.senderName,
            text: h.text,
            receivedAt: new Date().toISOString(), // DTO missing timestamp, fallback
            isOwn: h.senderPublicId === currentUserPublicId || h.senderName === currentUserName,
          })));
        })
        .catch(console.error);
    } else if (params.type === 'direct') {
      chatEndpoints.getDirectHistory(params.schoolPublicId, params.threadId)
        .then((history: DirectMessageDto[]) => {
          if (!isMounted) return;
          setMessages(history.map(h => ({
            id: h.publicId,
            senderPublicId: h.senderPublicId,
            senderName: h.senderName,
            text: h.text,
            receivedAt: new Date().toISOString(),
            isOwn: h.senderPublicId === currentUserPublicId || h.senderName === currentUserName,
          })));
        })
        .catch(console.error);
    }

    return () => {
      isMounted = false;
    };
  }, [params.threadId, params.type, params.schoolPublicId, currentUserName]);

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
      connection.invoke('SendMessageToBreanch', params.schoolPublicId, parseInt(params.threadId, 10), text).catch(console.error);
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
