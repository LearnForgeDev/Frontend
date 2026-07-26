import { useEffect, useState, useCallback } from 'react';
import { useChatHubConnection, type ChatHubParams } from '@/Assets/Hooks/useSignalR/chatHub';
import type { ChatMessage, ChatFileDto } from '@/Services/Chat/Chat.types';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import { chatEndpoints, filesEndpoints } from '@/Endpoints';

interface ApiFileItem {
  publicId?: string;
  PublicId?: string;
  fileName?: string;
  FileName?: string;
  fileUrl?: string;
  FileUrl?: string;
}

interface ApiHistoryItem {
  publicId?: string;
  PublicId?: string;
  senderPublicId?: string;
  SenderPublicId?: string;
  senderName?: string;
  SenderName?: string;
  text?: string;
  Text?: string;
  files?: ApiFileItem[];
  Files?: ApiFileItem[];
  sentAt?: string;
  SentAt?: string;
}

function mapFiles(raw: ApiFileItem[] | undefined, schoolPublicId: string): ChatFileDto[] {
  if (!raw || raw.length === 0) return [];
  return raw.map(f => {
    const id = f.publicId ?? f.PublicId ?? '';
    const name = f.fileName ?? f.FileName ?? '';
    const url = id ? filesEndpoints.getFileUrl(schoolPublicId, id) : (f.fileUrl ?? f.FileUrl ?? '');
    return { publicId: id, fileName: name, fileUrl: url };
  });
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
          setMessages(history.map(h => {
            const timeStr = h.sentAt ?? h.SentAt;
            return {
              id: h.publicId ?? h.PublicId ?? crypto.randomUUID(),
              senderPublicId: h.senderPublicId ?? h.SenderPublicId ?? '',
              senderName: h.senderName ?? h.SenderName ?? 'Unknown',
              text: h.text ?? h.Text ?? '',
              receivedAt: timeStr ? new Date(timeStr).toISOString() : new Date().toISOString(),
              sentAt: timeStr,
              isOwn: (h.senderPublicId ?? h.SenderPublicId) === currentUserPublicId || (h.senderName ?? h.SenderName) === currentUserName,
              files: mapFiles(h.files ?? h.Files, params.schoolPublicId),
            };
          }));
        })
        .catch(console.error);
    } else if (params.type === 'direct') {
      chatEndpoints.getDirectHistory(params.schoolPublicId, params.threadId)
        .then((history: ApiHistoryItem[]) => {
          if (!isMounted) return;
          setMessages(history.map(h => {
            const timeStr = h.sentAt ?? h.SentAt;
            return {
              id: h.publicId ?? h.PublicId ?? crypto.randomUUID(),
              senderPublicId: h.senderPublicId ?? h.SenderPublicId ?? '',
              senderName: h.senderName ?? h.SenderName ?? 'Unknown',
              text: h.text ?? h.Text ?? '',
              receivedAt: timeStr ? new Date(timeStr).toISOString() : new Date().toISOString(),
              sentAt: timeStr,
              isOwn: (h.senderPublicId ?? h.SenderPublicId) === currentUserPublicId || (h.senderName ?? h.SenderName) === currentUserName,
              files: mapFiles(h.files ?? h.Files, params.schoolPublicId),
            };
          }));
        })
        .catch(console.error);
    }

    return () => {
      isMounted = false;
    };
  }, [params.threadId, params.type, params.schoolPublicId, currentUserName, currentUserPublicId]);

  useEffect(() => {
    if (!connection) return;

    const handler = (senderPublicId: string, senderName: string, text: string, files?: ApiFileItem[], sentAt?: string) => {
      const isOwn = senderPublicId === currentUserPublicId || senderName === currentUserName;
      const timeStr = sentAt || new Date().toISOString();
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        senderPublicId,
        senderName,
        text,
        receivedAt: timeStr,
        sentAt: timeStr,
        isOwn,
        files: mapFiles(files, params.schoolPublicId),
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    connection.on('ReceiveMessage', handler);

    return () => {
      connection.off('ReceiveMessage', handler);
    };
  }, [connection, currentUserName, currentUserPublicId, params.schoolPublicId]);

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
