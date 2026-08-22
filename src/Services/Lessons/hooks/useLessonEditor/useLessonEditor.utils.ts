import type { SerializedDocument } from '@lexical/file';
import type { SerializedEditorState } from 'lexical';
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

const getLessonDraftKey = (lessonId: string | number): string => (
  `${LESSON_DRAFT_STORAGE_PREFIX}-${lessonId}`
);

export const readLessonDraft = (lessonId: string | number): SerializedDocument | undefined => {
  try {
    const serializedDraft = localStorage.getItem(getLessonDraftKey(lessonId));
    return serializedDraft ? normalizeLessonDocument(JSON.parse(serializedDraft)) : undefined;
  } catch {
    return undefined;
  }
};

export const writeLessonDraft = (
  lessonId: string | number,
  document: SerializedDocument,
): void => {
  localStorage.setItem(getLessonDraftKey(lessonId), JSON.stringify(document));
};
