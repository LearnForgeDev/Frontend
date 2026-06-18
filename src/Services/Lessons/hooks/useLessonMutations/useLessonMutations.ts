import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints/lessons.endpoints';
import type { AppError } from '@/Endpoints/factory';
import type {
  CreateLessonVars,
  DeleteLessonVars,
} from '@/Services/Lessons/hooks/useLessonMutations/useLessonMutations.types';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import { useParams } from 'react-router-dom';

export function useLessonMutations() {
  const queryClient = useQueryClient();
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();

  if (!schoolPublicId) {
    throw new Error('useLessonMutations must have a valid schoolPublicId');
  }

  const createLesson = useMutation<Lesson, AppError, CreateLessonVars>({
    mutationFn: async (vars: CreateLessonVars): Promise<Lesson> => {
      return lessonsEndpoints.createLesson(schoolPublicId, vars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', schoolPublicId] });
    },
  });

  const deleteLesson = useMutation<void, AppError, DeleteLessonVars, { previousData: Lesson[] | undefined }>({
    mutationFn: ({ id }) => lessonsEndpoints.deleteLesson(schoolPublicId, id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['lessons', schoolPublicId] });
      const previousData = queryClient.getQueryData<Lesson[]>(['lessons', schoolPublicId]);

      if (previousData) {
        queryClient.setQueryData<Lesson[]>(['lessons', schoolPublicId], (old) => {
          if (!old) return old;
          return old.filter((lesson) => lesson.id !== id);
        });
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['lessons', schoolPublicId], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', schoolPublicId] });
    },
  });

  return {
    createLesson,
    deleteLesson,
  };
}
