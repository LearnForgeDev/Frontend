import { useState } from 'react';
import { useLessonMutations } from '../useLessonMutations/useLessonMutations';
import { useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/Assets/Hooks/useNotification/useNotification';
import type { UseCreateLessonFlowReturn } from './useCreateLessonFlow.types';
import { filesEndpoints } from '@/Endpoints';
import { useParams } from 'react-router-dom';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('useCreateLessonFlow');


export function useCreateLessonFlow({
  onSuccess
}: {
  onSuccess?: (lessonId: string, title: string) => void
} = {}): UseCreateLessonFlowReturn {
  const { createLesson } = useLessonMutations();
  const queryClient = useQueryClient();
  const { createNotification } = useNotification();
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const [isFileUploading, setIsFileUploading] = useState(false);

  const handleCreateLesson = async (title: string = 'Новый урок', description: string = '') => {
    if (!schoolPublicId) {
      createNotification('Школа не найдена', undefined, 'error');
      return;
    }

    try {
      setIsFileUploading(true);
      const emptyLexicalJson = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';
      const file = new File([emptyLexicalJson], `lesson::${encodeURIComponent(title)}.lesson`, { type: 'application/json' });
      const uploadedFile = await filesEndpoints.uploadFileMultipart(schoolPublicId, file, undefined, undefined, 'lessons');
      setIsFileUploading(false);

      const newLesson = await createLesson.mutateAsync({
        title,
        description,
        lessonJsonFilePublicId: uploadedFile.publicId
      });
      
      await queryClient.invalidateQueries({ queryKey: ['lessons', schoolPublicId] });
      
      if (onSuccess) {
        onSuccess(newLesson.id, newLesson.title);
      }
      
      createNotification('Урок успешно создан', undefined, 'success');
    } catch (error) {
      logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to create lesson flow', error);
      setIsFileUploading(false);
      createNotification('Ошибка при создании урока', undefined, 'error');
    }
  };

  return {
    handleCreateLesson,
    isCreating: createLesson.isPending || isFileUploading,
  };
}
