export interface LessonFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt?: string;
  color?: string;
}

export interface Lesson {
  id: string;
  publicId: string;
  title: string;
  description?: string;
  lessonJsonFile?: {
    publicId: string;
    fileName: string;
    storageKey: string;
  };
  authorId?: number;
  updatedAt?: string;
  status?: string;
  content?: unknown;
  folderId?: string | null;
}
