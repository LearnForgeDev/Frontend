import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { AppError } from '@/Endpoints/factory';

export interface UseLessonsOptions {
  search: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface UseLessonsReturn {
  lessons: Lesson[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
  refetch: () => void;
}
