import type { Lesson, LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { AppError } from '@/Endpoints/factory';

export interface UseLessonsOptions {
  folderId: string | null;
  search: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface UseLessonsReturn {
  lessons: Lesson[] | undefined;
  folders: LessonFolder[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
  refetch: () => void;
}
