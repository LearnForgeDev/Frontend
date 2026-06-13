import { useQuery } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints/lessons.endpoints';
import type { UseLessonsOptions, UseLessonsReturn } from './useLessons.types';
import type { Lesson, LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { AppError } from '@/Endpoints/factory';

export const queryKeys = {
  lessons: (options: UseLessonsOptions) => ['lessons', options] as const,
  folders: (folderId: string | null) => ['lessons', 'folders', folderId] as const,
};

export function useLessons(options: UseLessonsOptions): UseLessonsReturn {
  const { folderId, search, sort, order } = options;

  const lessonsQuery = useQuery<Lesson[], AppError>({
    queryKey: queryKeys.lessons(options),
    queryFn: () => lessonsEndpoints.getLessons({ folderId, search, sort, order }),
    staleTime: 2 * 60 * 1000,
    select: (data) => {
      let filtered = [...data];
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter((lesson) =>
          lesson.title.toLowerCase().includes(query)
        );
      }
      if (sort) {
        const key = sort as keyof Lesson;
        filtered.sort((a, b) => {
          const valA = String(a[key] ?? '').toLowerCase();
          const valB = String(b[key] ?? '').toLowerCase();
          const comparison = valA.localeCompare(valB);
          return order === 'desc' ? -comparison : comparison;
        });
      }
      return filtered;
    },
  });

  const foldersQuery = useQuery<LessonFolder[], AppError>({
    queryKey: queryKeys.folders(folderId),
    queryFn: () => lessonsEndpoints.getFolders({ parentId: folderId }),
    staleTime: 2 * 60 * 1000,
    select: (data) => {
      let filtered = [...data];
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter((folder) =>
          folder.name.toLowerCase().includes(query)
        );
      }
      return filtered;
    },
  });

  const isLoading = lessonsQuery.isLoading || foldersQuery.isLoading;
  const isError = lessonsQuery.isError || foldersQuery.isError;
  const error = lessonsQuery.error || foldersQuery.error || null;

  const refetch = () => {
    lessonsQuery.refetch();
    foldersQuery.refetch();
  };

  return {
    lessons: lessonsQuery.data,
    folders: foldersQuery.data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
