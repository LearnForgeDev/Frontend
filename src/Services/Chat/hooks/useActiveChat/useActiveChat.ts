import { useEffect, useRef, useState } from 'react';
import type { ChatThread } from '../../Chat.types';
import { useChatMessages } from '../useChatMessages/useChatMessages';
import { useDownloadChatFile } from '../useDownloadChatFile/useDownloadChatFile';
import { useCreateChatCallInvite } from '../useCreateChatCallInvite/useCreateChatCallInvite';

export function useActiveChat(thread: ChatThread | null) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [previewImageFileId, setPreviewImageFileId] = useState<string | null>(null);
  const chat = useChatMessages({ type: thread?.type ?? 'branch', threadId: thread?.id ?? '', schoolPublicId: thread?.schoolPublicId ?? '' });
  const call = useCreateChatCallInvite({ thread, sendMessage: chat.sendMessage });
  const downloadFile = useDownloadChatFile(thread?.schoolPublicId ?? '');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  return { ...chat, call, downloadFile, messagesEndRef, previewImageFileId, previewImage: setPreviewImageFileId, closePreview: () => setPreviewImageFileId(null) };
}
