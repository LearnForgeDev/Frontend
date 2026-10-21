import { MESSAGE_MAX_LENGTH } from '../../Chat.const';
import type { ChatDraft, ChatDraftAction } from './useChatDraft.types';

export function createChatDraft(): ChatDraft {
  return { text: '', textRevision: 0, files: [], error: null };
}

export function canSendChatDraft(draft: ChatDraft): boolean {
  const text = draft.text.trim();
  return (text.length > 0 || draft.files.length > 0) && text.length <= MESSAGE_MAX_LENGTH;
}

export function chatDraftReducer(state: Record<string, ChatDraft>, action: ChatDraftAction): Record<string, ChatDraft> {
  const key = action.type === 'sent' ? action.snapshot.key : action.key;
  const draft = state[key] ?? createChatDraft();
  if (action.type === 'text') return { ...state, [key]: { ...draft, text: action.text, textRevision: draft.textRevision + 1, error: null } };
  if (action.type === 'files') {
    const files = new Map(draft.files.map(file => [file.publicId, file]));
    for (const file of action.files) if (!files.has(file.publicId)) files.set(file.publicId, file);
    return { ...state, [key]: { ...draft, files: [...files.values()], error: null } };
  }
  if (action.type === 'removeFile') return { ...state, [key]: { ...draft, files: draft.files.filter(file => file.selectionId !== action.selectionId), error: null } };
  if (action.type === 'error') return { ...state, [key]: { ...draft, error: action.error } };
  const sentSelections = new Set(action.snapshot.files.map(file => file.selectionId));
  return {
    ...state,
    [key]: {
      ...draft,
      text: draft.textRevision === action.snapshot.textRevision ? '' : draft.text,
      files: draft.files.filter(file => !sentSelections.has(file.selectionId)),
      error: null,
    },
  };
}
