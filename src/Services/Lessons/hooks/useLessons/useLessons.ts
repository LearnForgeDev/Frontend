import { useQuery } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints';
import { useLessonsContext } from '@/Storage/LessonsContext/LessonsContext.tsx';
import type { UseLessonsReturn } from '@/Services/Lessons/hooks/useLessons/useLessons.types';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { AppError } from '@/Endpoints';
import { useParams } from 'react-router-dom';

export function useLessons(): UseLessonsReturn {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();

  if (!schoolPublicId) throw new Error('No active school public id');

  const { search: searchQuery, sort, order: sortOrder } = useLessonsContext();

  const {
    data: lessons,
    isLoading: isLoadingLessons,
    isError: isErrorLessons,
    error: errorLessons,
    refetch: refetchLessons,
  } = useQuery<Lesson[], AppError>({
    queryKey: ['lessons', schoolPublicId],
    queryFn: () => lessonsEndpoints.getLessons(schoolPublicId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  let processedLessons = lessons;
  if (processedLessons) {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      processedLessons = processedLessons.filter(l => l.title.toLowerCase().includes(lowerQuery));
    }
    processedLessons = [...processedLessons].sort((a, b) => {
      const aVal = a[sort as keyof Lesson] || '';
      const bVal = b[sort as keyof Lesson] || '';
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const res = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? res : -res;
      }
      return 0;
    });
  }

  return {
    lessons: processedLessons,
    folders: undefined,
    isLoading: isLoadingLessons,
    isError: isErrorLessons,
    error: errorLessons,
    refetch: refetchLessons,
  };
}
