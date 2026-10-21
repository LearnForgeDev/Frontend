import type { ChatMessage, ChatFileDto } from '../../Chat.types';
import { filesEndpoints } from '@/Endpoints';
import { UNKNOWN_SENDER } from './useChatMessages.const';

interface ApiFileItem {
  publicId?: string;
  PublicId?: string;
  fileName?: string;
  FileName?: string;
  fileUrl?: string;
  FileUrl?: string;
}

export interface ApiHistoryItem {
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

export function mapChatHistory(history: ApiHistoryItem[], schoolPublicId: string, userPublicId?: string, userName?: string): ChatMessage[] {
  return history.map(item => {
    const sentAt = item.sentAt ?? item.SentAt;
    return {
      id: item.publicId ?? item.PublicId ?? crypto.randomUUID(),
      senderPublicId: item.senderPublicId ?? item.SenderPublicId ?? '',
      senderName: item.senderName ?? item.SenderName ?? UNKNOWN_SENDER,
      text: item.text ?? item.Text ?? '',
      receivedAt: sentAt ? new Date(sentAt).toISOString() : new Date().toISOString(),
      sentAt,
      isOwn: (item.senderPublicId ?? item.SenderPublicId) === userPublicId || (item.senderName ?? item.SenderName) === userName,
      files: mapFiles(item.files ?? item.Files, schoolPublicId),
    };
  });
}
