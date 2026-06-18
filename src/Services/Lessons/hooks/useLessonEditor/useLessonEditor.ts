import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { lessonsEndpoints } from '@/Endpoints/lessons.endpoints';
import type { UseLessonEditorProps, UseLessonEditorReturn } from './useLessonEditor.types';

export const useLessonEditor = ({ lessonId }: UseLessonEditorProps): UseLessonEditorReturn => {
  const queryClient = useQueryClient();
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const queryKey = ['lessonEditorState', lessonId, schoolPublicId];

  const {
    data: editorState,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => {
      if (!schoolPublicId) throw new Error('Missing schoolPublicId');
      return lessonsEndpoints.getEditorStateAsJson(schoolPublicId, lessonId);
    },
    enabled: Boolean(lessonId && schoolPublicId),
  });

  const mutation = useMutation({
    mutationFn: (serializedState: unknown) => {
      if (!schoolPublicId) throw new Error('Missing schoolPublicId');
      return lessonsEndpoints.sendEditorStateAsJson(schoolPublicId, lessonId, serializedState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    editorState,
    isLoading,
    isError,
    saveEditorState: async (serializedState: unknown) => {
      await mutation.mutateAsync(serializedState);
    },
    isSaving: mutation.isPending,
  };
};
