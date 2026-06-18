import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints/lessons.endpoints';
import type { UseLessonEditorProps, UseLessonEditorReturn } from './useLessonEditor.types';

export const useLessonEditor = ({ lessonId }: UseLessonEditorProps): UseLessonEditorReturn => {
  const queryClient = useQueryClient();
  const queryKey = ['lessonEditorState', lessonId];

  const {
    data: editorState,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => lessonsEndpoints.getEditorStateAsJson(lessonId),
    enabled: Boolean(lessonId),
  });

  const mutation = useMutation({
    mutationFn: (serializedState: unknown) =>
      lessonsEndpoints.sendEditorStateAsJson(lessonId, serializedState),
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
