
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';

export interface CreateLessonVars {
  title: string;
  folderId: string | null;
}

export type UpdateLessonVars = { id: string } & Partial<Lesson>;

export interface DeleteLessonVars {
  id: string;
}

export interface CreateFolderVars {
  name: string;
  parentId: string | null;
  color?: string;
}

export interface UpdateFolderVars {
  id: string;
  name?: string;
  parentId?: string | null;
  color?: string;
}

export interface DeleteFolderVars {
  id: string;
}
