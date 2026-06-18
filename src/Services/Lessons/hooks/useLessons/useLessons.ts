import { useQuery } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints/lessons.endpoints';
import { useLessonsContext } from '@/Storage/Context/LessonsContext';
import type { UseLessonsReturn } from '@/Services/Lessons/hooks/useLessons/useLessons.types';
import type { Lesson, LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { AppError } from '@/Endpoints/factory';
import { useParams } from 'react-router-dom';

export function useLessons(): UseLessonsReturn {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();

  if (!schoolPublicId) throw new Error('No active school public id');

  const { folderId: currentFolderId, search: searchQuery, sort, order: sortOrder } = useLessonsContext();

  const {
    data: lessons,
    isLoading: isLoadingLessons,
    isError: isErrorLessons,
    error: errorLessons,
    refetch: refetchLessons,
  } = useQuery<Lesson[], AppError>({
    queryKey: ['lessons', schoolPublicId, currentFolderId, searchQuery, sort, sortOrder],
    queryFn: () =>
      lessonsEndpoints.getLessons(schoolPublicId, {
        folderId: currentFolderId,
        search: searchQuery,
        sort,
        order: sortOrder,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const {
    data: folders,
    isLoading: isLoadingFolders,
    isError: isErrorFolders,
    error: errorFolders,
    refetch: refetchFolders,
  } = useQuery<LessonFolder[], AppError>({
    queryKey: ['lessonFolders', schoolPublicId, currentFolderId],
    queryFn: () => lessonsEndpoints.getFolders(schoolPublicId, { parentId: currentFolderId }),
    staleTime: 2 * 60 * 1000,
  });

  return {
    lessons,
    folders,
    isLoading: isLoadingLessons || isLoadingFolders,
    isError: isErrorLessons || isErrorFolders,
    error: errorLessons || errorFolders,
    refetch: () => {
      refetchLessons();
      refetchFolders();
    },
  };
}
