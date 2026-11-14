

export interface ApiFileItem {
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
