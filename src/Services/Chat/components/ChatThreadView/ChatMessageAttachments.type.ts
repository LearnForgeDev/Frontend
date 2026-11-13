import type { ChatFileDto } from '../../Chat.type';

export interface ChatMessageAttachmentsProps {
  files?: ChatFileDto[];
  schoolPublicId: string;
  compact?: boolean;
  onPreview: (filePublicId: string) => void;
  onDownload: (filePublicId: string, fileName?: string) => void;
}
