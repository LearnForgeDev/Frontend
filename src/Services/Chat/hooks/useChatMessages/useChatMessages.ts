import { useEffect, useState, useCallback } from 'react';
import { useChatHubConnection, type ChatHubParams } from '@/Assets/Hooks/useSignalR/chatHub';
import type { ChatMessage } from '@/Services/Chat/Chat.types';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';

import { chatEndpoints } from '@/Endpoints';

interface ApiHistoryItem {
  publicId?: string;
  PublicId?: string;
  senderPublicId?: string;
  SenderPublicId?: string;
  senderName?: string;
  SenderName?: string;
  text?: string;
  Text?: string;
  files?: import('@/Services/Chat/Chat.types').ChatFileDto[];
  Files?: import('@/Services/Chat/Chat.types').ChatFileDto[];
}

export function useChatMessages(params: ChatHubParams) {
  const { connection, status } = useChatHubConnection(params);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prevThreadId, setPrevThreadId] = useState(params.threadId);
  const currentUserName = useGlobalContext((s) => s.auth.user?.userName);
  const currentUserPublicId = useGlobalContext((s) => s.auth.user?.userPublicId);

  if (params.threadId !== prevThreadId) {
    setPrevThreadId(params.threadId);
    setMessages([]);
  }

  useEffect(() => {
    let isMounted = true;

    if (!params.threadId || !params.schoolPublicId) return;

    if (params.type === 'branch') {
      chatEndpoints.getBranchHistory(params.schoolPublicId, params.threadId)
        .then((history: ApiHistoryItem[]) => {
          if (!isMounted) return;
          setMessages(history.map(h => ({
            id: h.publicId ?? h.PublicId ?? '',
            senderPublicId: h.senderPublicId ?? h.SenderPublicId ?? '',
            senderName: h.senderName ?? h.SenderName ?? '',
            text: h.text ?? h.Text ?? '',
            receivedAt: new Date().toISOString(), // DTO missing timestamp, fallback
            isOwn: (h.senderPublicId ?? h.SenderPublicId) === currentUserPublicId || (h.senderName ?? h.SenderName) === currentUserName,
            files: h.files ?? h.Files ?? [],
          })));
        })
        .catch(console.error);
    } else if (params.type === 'direct') {
      chatEndpoints.getDirectHistory(params.schoolPublicId, params.threadId)
        .then((history: ApiHistoryItem[]) => {
          if (!isMounted) return;
          setMessages(history.map(h => ({
            id: h.publicId ?? h.PublicId ?? '',
            senderPublicId: h.senderPublicId ?? h.SenderPublicId ?? '',
            senderName: h.senderName ?? h.SenderName ?? '',
            text: h.text ?? h.Text ?? '',
            receivedAt: new Date().toISOString(),
            isOwn: (h.senderPublicId ?? h.SenderPublicId) === currentUserPublicId || (h.senderName ?? h.SenderName) === currentUserName,
            files: h.files ?? h.Files ?? [],
          })));
        })
        .catch(console.error);
    }

    return () => {
      isMounted = false;
    };
  }, [params.threadId, params.type, params.schoolPublicId, currentUserName, currentUserPublicId]);

  useEffect(() => {
    if (!connection) return;

    const handler = (senderPublicId: string, senderName: string, text: string, files?: import('@/Services/Chat/Chat.types').ChatFileDto[]) => {
      const isOwn = senderPublicId === currentUserPublicId || senderName === currentUserName;
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        senderPublicId,
        senderName,
        text,
        receivedAt: new Date().toISOString(),
        isOwn,
        files: files ?? [],
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    connection.on('ReceiveMessage', handler);

    return () => {
      connection.off('ReceiveMessage', handler);
    };
  }, [connection, currentUserName, currentUserPublicId]);

  const sendMessage = useCallback((text: string, filePublicIds: string[] = []) => {
    if (!connection || status !== 'connected') return;

    if (params.type === 'branch') {
      connection.invoke('SendMessageToBreanch', params.schoolPublicId, params.threadId, text, filePublicIds).catch(console.error);
    } else {
      connection.invoke('SendMessageToDirect', params.schoolPublicId, params.threadId, text, filePublicIds).catch(console.error);
    }
  }, [connection, status, params]);

  return {
    messages,
    sendMessage,
    status,
    isConnecting: status === 'connecting' || status === 'reconnecting',
  };
}
