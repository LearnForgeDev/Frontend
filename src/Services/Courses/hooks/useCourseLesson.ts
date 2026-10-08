import { useQuery } from '@tanstack/react-query';
import { useCourseQuery } from './useCourseQueries';
import { useToast } from '@/Storage/useToastStore';
import { lessonsEndpoints, filesEndpoints } from '@/Endpoints';
import { parseLessonContent } from '../utils/lessonContent';

export function useCourseLesson(schoolPublicId: string, coursePublicId: string, lessonId: string) {
  const courseQuery = useCourseQuery(schoolPublicId, coursePublicId);
  const toast = useToast();
  const lesson = courseQuery.data?.lessons.find((item) => String(item.lessonId) === lessonId);
  const contentQuery = useQuery({
    queryKey: ['course-lesson-content', schoolPublicId, coursePublicId, lessonId],
    queryFn: async () => {
      try {
        const metadata = await lessonsEndpoints.getLessonById(schoolPublicId, lessonId);
        if (!metadata.lessonJsonFile) throw new Error('Содержимое урока недоступно');
        return parseLessonContent(await filesEndpoints.getFileContent(schoolPublicId, metadata.lessonJsonFile.publicId));
      } catch (error) {
        toast.error('Не удалось загрузить урок. Попробуйте ещё раз.');
        throw error;
      }
    },
    enabled: Boolean(lesson),
    retry: false,
  });

  return {
    course: courseQuery.data,
    lesson,
    content: contentQuery.data,
    isLoading: courseQuery.isLoading || (Boolean(lesson) && contentQuery.isLoading),
    isError: courseQuery.isError || contentQuery.isError,
    isRetrying: courseQuery.isFetching || contentQuery.isFetching,
    retry: () => courseQuery.isError ? courseQuery.refetch() : contentQuery.refetch(),
  };
}
