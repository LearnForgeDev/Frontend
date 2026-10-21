import { useQuery } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints';
import { useToast } from '@/Storage/useToastStore';

export function useLessonQuery(schoolPublicId: string, lessonId: string | number) {
  const toast = useToast();
  return useQuery({
    queryKey: ['lesson', schoolPublicId, String(lessonId)],
    queryFn: async () => {
      try {
        return await lessonsEndpoints.getLessonById(schoolPublicId, String(lessonId));
      } catch (error) {
        toast.error('Не удалось открыть урок.');
        throw error;
      }
    },
    enabled: Boolean(schoolPublicId && lessonId),
    networkMode: 'always',
    retry: false,
  });
}
