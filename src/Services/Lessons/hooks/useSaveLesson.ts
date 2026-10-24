import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { lessonsEndpoints } from '@/Endpoints';
import type { UpdateLessonRequest } from '@/Endpoints/lessons/types';
import type { Lesson } from '../components/FileManager/FileManager.types';
import { LESSON_CONFLICT_STATUS } from './useSaveLesson.const';

export function useSaveLesson(schoolPublicId: string, lessonId: string | number) {
  const queryClient = useQueryClient();
  const mutationKey = ['save-lesson', schoolPublicId, String(lessonId)];
  const isSaving = useIsMutating({ mutationKey }) > 0;
  const mutation = useMutation({
    mutationKey,
    networkMode: 'always',
    scope: { id: mutationKey.join('/') },
    mutationFn: (request: UpdateLessonRequest) => lessonsEndpoints.updateLesson(schoolPublicId, String(lessonId), request),
    onError: async error => {
      if (isAxiosError(error) && error.response?.status === LESSON_CONFLICT_STATUS) {
        await queryClient.invalidateQueries({ queryKey: ['lesson', schoolPublicId, String(lessonId)] });
      }
    },
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
