import type { SerializedDocument } from '@lexical/file';

export interface UseLessonEditorProps {
  lessonId: string | number;
}

export interface LessonDraftScope {
  userPublicId: string;
  schoolPublicId: string;
  lessonId: string | number;
}
export interface LessonDraft {
  document: SerializedDocument;
  storageKey?: string;
}
