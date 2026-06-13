export interface Lesson {
  id: string;
  title: string;
  folderId: string | null;
  status?: string;
  content?: unknown;
  updatedAt?: string;
}

export interface LessonFolder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
}

