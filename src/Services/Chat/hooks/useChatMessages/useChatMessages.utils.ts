import type { ApiFileItem, ApiHistoryItem } from './useChatMessages.utils.type';
export type { ApiHistoryItem } from './useChatMessages.utils.type';
import type { ChatMessage, ChatFileDto } from '../../Chat.type';
import { filesEndpoints } from '@/Endpoints';
import { UNKNOWN_SENDER } from './useChatMessages.const';

function mapFiles(raw: ApiFileItem[] | undefined, schoolPublicId: string): ChatFileDto[] {
  if (!raw || raw.length === 0) {
    return [];
  }
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
