export interface ChatDraftFile {
  publicId: string;
  fileName: string;
}

export interface SelectedChatDraftFile extends ChatDraftFile {
  selectionId: string;
}

export interface ChatDraft {
  text: string;
  textRevision: number;
  files: SelectedChatDraftFile[];
  error: string | null;
}

export interface ChatDraftSnapshot extends ChatDraft {
  key: string;
}

export type ChatDraftAction =
  | { type: 'text'; key: string; text: string }
  | { type: 'files'; key: string; files: SelectedChatDraftFile[] }
  | { type: 'removeFile'; key: string; selectionId: string }
  | { type: 'error'; key: string; error: string | null }
  | { type: 'sent'; snapshot: ChatDraftSnapshot };
