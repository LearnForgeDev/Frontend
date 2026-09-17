export type ChatType = 'branch' | 'direct';

export interface ChatThread {
  id: string; // branchId (publicId GUID) for branches, otherUserId (publicId GUID) for direct
  type: ChatType;
  name: string; // branch name or person's display name
  schoolPublicId: string; // GUID, needed for hub connections
  lastMessage?: {
    senderName: string;
    text: string;
    receivedAt: string;
  };
}

export interface ChatMessage {
  id: string;
  senderPublicId?: string;
  senderName: string;
  text: string;
  receivedAt: string; // ISO timestamp (sentAt from server or fallback)
  sentAt?: string;
  isOwn: boolean;
  files?: ChatFileDto[];
}

export interface ChatFileDto {
  publicId?: string;
  fileName?: string;
  fileUrl?: string;
}

export interface ChatMessageTextPart {
  type: 'text' | 'link';
  value: string;
}

export interface ChatCallInvite {
  title: string;
  url: string;
}

export interface BranchMessageDto {
  publicId: string;
  senderPublicId: string;
  senderName: string;
  text: string;
  files: ChatFileDto[];
  sentAt?: string;
}

export interface DirectMessageDto {
  publicId: string;
  senderPublicId: string;
  senderName: string;
  receiverPublicId: string;
  receiverName: string;
  text: string;
  files: ChatFileDto[];
  sentAt?: string;
}
