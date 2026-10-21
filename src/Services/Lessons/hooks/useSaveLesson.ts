import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints';
import type { UpdateLessonRequest } from '@/Endpoints/lessons/types';
import type { Lesson } from '../components/FileManager/FileManager.types';

export function useSaveLesson(schoolPublicId: string, lessonId: string | number) {
  const queryClient = useQueryClient();
  const mutationKey = ['save-lesson', schoolPublicId, String(lessonId)];
  const isSaving = useIsMutating({ mutationKey }) > 0;
  const mutation = useMutation({
    mutationKey,
    networkMode: 'always',
    scope: { id: mutationKey.join('/') },
    mutationFn: (request: UpdateLessonRequest) => lessonsEndpoints.updateLesson(schoolPublicId, String(lessonId), request),
    onSuccess: (lesson, request) => {
      if (request.content) {
        queryClient.setQueryData(['lesson-content', schoolPublicId, String(lessonId), lesson.lessonJsonFile?.storageKey], request.content);
      }
      queryClient.setQueryData(['lesson', schoolPublicId, String(lessonId)], lesson);
      queryClient.setQueryData<Lesson[]>(['lessons', schoolPublicId], previous => previous?.map(item => String(item.id) === String(lessonId) ? lesson : item));
      void queryClient.invalidateQueries({ queryKey: ['lessons', schoolPublicId] });
      void queryClient.invalidateQueries({ queryKey: ['courses', schoolPublicId] });
      void queryClient.invalidateQueries({ queryKey: ['course-lesson-content', schoolPublicId] });
    },
  });

  return { ...mutation, isSaving };
}
