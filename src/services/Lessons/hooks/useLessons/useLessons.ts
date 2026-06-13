import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { filesEndpoints } from '@/Endpoints/files.endpoints';
import { isLessonFile, apiFileToLesson } from '@/Endpoints/files.types';
import { useSchoolId } from '@/Services/Lessons/hooks/useSchoolId/useSchoolId';
import { useLessonsContext } from '@/Storage/Context/LessonsContext';
import type { UseLessonsReturn } from '@/Services/Lessons/hooks/useLessons/useLessons.types';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { AppError } from '@/Endpoints/factory';

function sortLessons(lessons: Lesson[], sort: string, sortOrder: 'asc' | 'desc') {
  if (!sort) return lessons;
  const key = sort as keyof Lesson;
  return lessons.sort((a, b) => {
    const valA = String(a[key] ?? '').toLowerCase();
    const valB = String(b[key] ?? '').toLowerCase();
    const comparison = valA.localeCompare(valB);
    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

export function useLessons(): UseLessonsReturn {
  const schoolId = useSchoolId();
  const { folderId: currentFolderId, search: searchQuery, sort, order: sortOrder, allFolders } = useLessonsContext();

  const { data: lessons, isLoading, isError, error, refetch } = useQuery<Lesson[], AppError>({
    queryKey: ['lessons', schoolId],
    queryFn: () => filesEndpoints.listFiles(schoolId).then((files) => files.filter(isLessonFile).map(apiFileToLesson)),
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      let result = data;
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter((l) => l.title.toLowerCase().includes(q));
      } else {
        result = result.filter((l) => l.folderId === currentFolderId);
      }
      return sortLessons(result, sort, sortOrder);
    },
  });

  const folders = useMemo(
    () => allFolders.filter((f) => f.parentId === currentFolderId),
    [allFolders, currentFolderId]
  );

  return {
    lessons,
    folders,
    isLoading,
    isError,
    error,
    refetch,
  };
}
