import type { SerializedDocument } from '@lexical/file';
import type { SerializedEditorState } from 'lexical';
import type { LessonDraftScope } from './useLessonEditor.types';
import {
  LESSON_DRAFT_STORAGE_PREFIX,
  LEXICAL_DOCUMENT_SOURCE,
  LEXICAL_DOCUMENT_VERSION,
} from './useLessonEditor.const';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
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

  if (isRecord(value.editorState) && isRecord(value.editorState.root)) {
    return value as unknown as SerializedDocument;
  }

  if (isRecord(value.content) && isRecord(value.content.root)) {
    return createSerializedDocument(value.content as unknown as SerializedEditorState);
  }

  if (isRecord(value.root)) {
    return createSerializedDocument(value as unknown as SerializedEditorState);
  }

  return undefined;
};

const getLessonDraftKey = (scope: LessonDraftScope): string => (
  `${LESSON_DRAFT_STORAGE_PREFIX}:${scope.userPublicId}:${scope.schoolPublicId}:${scope.lessonId}`
);

export const readLessonDraft = (scope: LessonDraftScope): SerializedDocument | undefined => {
  try {
    const serializedDraft = localStorage.getItem(getLessonDraftKey(scope));
    return serializedDraft ? normalizeLessonDocument(JSON.parse(serializedDraft)) : undefined;
  } catch {
    return undefined;
  }
};

export const writeLessonDraft = (
  scope: LessonDraftScope,
  document: SerializedDocument,
): void => {
  localStorage.setItem(getLessonDraftKey(scope), JSON.stringify(document));
};

export const clearSavedLessonDraft = (scope: LessonDraftScope, document: SerializedDocument): void => {
  const draft = readLessonDraft(scope);
  if (draft && JSON.stringify(draft.editorState) === JSON.stringify(document.editorState)) {
    localStorage.removeItem(getLessonDraftKey(scope));
  }
};

export const isLessonDocumentEmpty = (document: SerializedDocument): boolean => (
  document.editorState.root.children.every(node => {
    if (node.type !== 'paragraph') return false;
    const children = (node as { children?: { type: string; text?: string }[] }).children ?? [];
    return children.every(child => child.type === 'text' && !child.text?.trim());
  })
);
