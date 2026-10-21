import type { SerializedDocument } from '@lexical/file';
import type { SerializedEditorState } from 'lexical';
import type { LessonDraft, LessonDraftScope } from './useLessonEditor.types';
import {
  LESSON_DRAFT_STORAGE_PREFIX,
  LEXICAL_DOCUMENT_SOURCE,
  LEXICAL_DOCUMENT_VERSION,
} from './useLessonEditor.const';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isEditorState = (value: unknown): value is SerializedEditorState => (
  isRecord(value) && isRecord(value.root) && value.root.type === 'root' && Array.isArray(value.root.children)
);

const createSerializedDocument = (editorState: SerializedEditorState): SerializedDocument => ({
  editorState,
  lastSaved: Date.now(),
  source: LEXICAL_DOCUMENT_SOURCE,
  version: LEXICAL_DOCUMENT_VERSION,
});

export const normalizeLessonDocument = (value: unknown): SerializedDocument | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  if (isEditorState(value.editorState)) {
    return value as unknown as SerializedDocument;
  }

  if (isEditorState(value.content)) {
    return createSerializedDocument(value.content);
  }

  if (isEditorState(value)) {
    return createSerializedDocument(value);
  }

  return undefined;
};

const getLessonDraftKey = (scope: LessonDraftScope): string => (
  `${LESSON_DRAFT_STORAGE_PREFIX}:${scope.userPublicId}:${scope.schoolPublicId}:${scope.lessonId}`
);

export const readLessonDraft = (scope: LessonDraftScope): LessonDraft | undefined => {
  try {
    const serializedDraft = localStorage.getItem(getLessonDraftKey(scope));
    if (!serializedDraft) return undefined;
    const value: unknown = JSON.parse(serializedDraft);
    if (!isRecord(value)) return undefined;
    const document = normalizeLessonDocument(value.document ?? value);
    return document ? { document, storageKey: typeof value.storageKey === 'string' ? value.storageKey : undefined } : undefined;
  } catch {
    return undefined;
  }
};

export const writeLessonDraft = (
  scope: LessonDraftScope,
  document: SerializedDocument,
  storageKey?: string,
): void => {
  localStorage.setItem(getLessonDraftKey(scope), JSON.stringify({ document, storageKey }));
};

export const removeLessonDraft = (scope: LessonDraftScope): void => localStorage.removeItem(getLessonDraftKey(scope));

export const clearSavedLessonDraft = (scope: LessonDraftScope, document: SerializedDocument): void => {
  const draft = readLessonDraft(scope);
  if (draft && JSON.stringify(draft.document.editorState) === JSON.stringify(document.editorState)) {
    removeLessonDraft(scope);
  }
};

export const isLessonDocumentEmpty = (document: SerializedDocument): boolean => (
  document.editorState.root.children.every(node => {
    if (node.type !== 'paragraph') return false;
    const children = (node as { children?: { type: string; text?: string }[] }).children ?? [];
    return children.every(child => child.type === 'text' && !child.text?.trim());
  })
);
