import type { SerializedDocument } from '@lexical/file';

export interface UpdateLessonRequest {
  title: string;
  content?: SerializedDocument;
  expectedStorageKey?: string;
}

export interface CreateLessonRequest {
  title: string;
  description?: string | null;
  lessonJsonFilePublicId: string;
  allowedUserPublicIds?: string[] | null;
  allowedGroupIds?: number[] | null;
  filePublicIds?: string[] | null;
}
