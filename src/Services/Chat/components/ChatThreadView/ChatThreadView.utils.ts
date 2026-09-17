import type { ChatCallInvite, ChatMessageTextPart } from '@/Services/Chat/Chat.types';
import type { ChatConnectionStatus } from '@/Assets/Hooks/useSignalR/chatHub';
import type { ChipProps } from '@mui/material/Chip';

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;
const IMAGE_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const CALL_INVITE_TITLE_PREFIXES = ['Приглашение в звонок', 'Создан звонок'];

export function formatChatMessageTime(dateStr: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function isImageFile(fileName?: string): boolean {
  if (!fileName) return false;

  const extension = fileName.split('.').pop()?.toLowerCase();

  return IMAGE_FILE_EXTENSIONS.includes(extension || '');
}

export function splitChatMessageText(text: string): ChatMessageTextPart[] {
  const parts: ChatMessageTextPart[] = [];
  let lastIndex = 0;

  text.replace(URL_PATTERN, (url, _match, offset: number) => {
    if (offset > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, offset) });
    }

    parts.push({ type: 'link', value: url });
    lastIndex = offset + url.length;

    return url;
  });

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts;
}

export function parseChatCallInvite(text: string): ChatCallInvite | null {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const titleLine = lines.find((line) => CALL_INVITE_TITLE_PREFIXES.some((prefix) => line.startsWith(prefix)));
  const urlMatch = text.match(URL_PATTERN);

  if (!titleLine || !urlMatch?.[0]) {
    return null;
  }

  const title = titleLine.includes(':')
    ? titleLine.slice(titleLine.indexOf(':') + 1).trim()
    : titleLine;

  return {
    title,
    url: urlMatch[0],
  };
}

export function getChatStatusColor(status: ChatConnectionStatus): ChipProps['color'] {
  switch (status) {
    case 'connected':
      return 'success';
    case 'connecting':
    case 'reconnecting':
      return 'warning';
    case 'disconnected':
      return 'error';
    default:
      return 'default';
  }
}

export function getChatStatusLabel(status: ChatConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'На связи';
    case 'connecting':
      return 'Подключение';
    case 'reconnecting':
      return 'Переподключение';
    case 'disconnected':
      return 'Нет связи';
    default:
      return 'Неизвестно';
  }
}
