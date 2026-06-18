export type ChatType = 'branch' | 'direct';

export interface ChatThread {
  id: string; // branchId (int as string) for branches, otherUserId (publicId GUID) for direct
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
  senderName: string;
  text: string;
  receivedAt: string; // ISO 8601, constructed from Date.now()
  isOwn: boolean; // true when senderName === current user's userName
}
