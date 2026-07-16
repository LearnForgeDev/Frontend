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
  id: string; // crypto.randomUUID() assigned on receipt
  senderPublicId?: string;
  senderName: string;
  text: string;
  receivedAt: string; // ISO 8601, constructed from Date.now()
  isOwn: boolean; // true when senderName === current user's userName or senderPublicId matches
  files?: ChatFileDto[];
}

export interface ChatFileDto {
  publicId?: string;
  fileName?: string;
  fileUrl?: string;
}

export interface BranchMessageDto {
  publicId: string;
  senderPublicId: string;
  senderName: string;
  text: string;
  files: ChatFileDto[];
}

export interface DirectMessageDto {
  publicId: string;
  senderPublicId: string;
  senderName: string;
  receiverPublicId: string;
  receiverName: string;
  text: string;
  files: ChatFileDto[];
}
