import { useLessonMutations } from '../useLessonMutations/useLessonMutations';
import { useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/Assets/Hooks/useNotification/useNotification';
import type { UseCreateLessonFlowReturn } from './useCreateLessonFlow.types';

export function useCreateLessonFlow({
  onSuccess
}: {
  onSuccess?: (lessonId: string, title: string) => void
} = {}): UseCreateLessonFlowReturn {
  const { createLesson } = useLessonMutations();
  const queryClient = useQueryClient();
  const { createNotification } = useNotification();

  const handleCreateLesson = async (folderId: string | null = null, title: string = 'Новый урок') => {
    try {
      // 1. Create a draft lesson
      const newLesson = await createLesson.mutateAsync({ title, folderId });
      
      // 2. Refresh the lessons list to show the new draft
      await queryClient.invalidateQueries({ queryKey: ['lessons'] });
      
      if (onSuccess) {
        onSuccess(newLesson.id, newLesson.title);
      }
      
      createNotification('Урок успешно создан', undefined, 'success');
    } catch (error) {
      console.error('Failed to create lesson flow', error);
      createNotification('Ошибка при создании урока', undefined, 'error');
    }
  };

  return {
    handleCreateLesson,
    isCreating: createLesson.isPending,
  };
}
