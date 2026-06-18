export interface Lesson {
  id: number;
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
}
