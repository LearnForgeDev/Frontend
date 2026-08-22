import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { lessonsEndpoints } from '@/Endpoints';
import { filesEndpoints } from '@/Endpoints';
import type { UseLessonEditorProps, UseLessonEditorReturn } from './useLessonEditor.types';
import type { SerializedDocument } from '@lexical/file';
import {
  normalizeLessonDocument,
  readLessonDraft,
  writeLessonDraft,
} from './useLessonEditor.utils';

export const useLessonEditor = ({ lessonId }: UseLessonEditorProps): UseLessonEditorReturn => {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const queryKey = ['lessonEditorState', lessonId, schoolPublicId];

  // We need the lesson object to get the lessonJsonFilePublicId
  const { data: lesson } = useQuery({
    queryKey: ['lesson', schoolPublicId, lessonId],
    queryFn: () => {
      if (!schoolPublicId) throw new Error('Missing schoolPublicId');
      return lessonsEndpoints.getLessonById(schoolPublicId, String(lessonId));
    },
    enabled: Boolean(schoolPublicId && lessonId)
  });

  const fileId = lesson?.lessonJsonFile?.publicId;

  const {
    data: editorState,
    isLoading: isEditorLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!schoolPublicId) throw new Error('Missing schoolPublicId');
      const draft = readLessonDraft(lessonId);
      if (draft) return draft;
      if (!fileId) return undefined;
      const content = await filesEndpoints.getFileContent(schoolPublicId, fileId);
      const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      return normalizeLessonDocument(parsedContent);
    },
    enabled: Boolean(lessonId && schoolPublicId && fileId),
  });

  const mutation = useMutation({
    mutationFn: async (serializedState: SerializedDocument) => {
      writeLessonDraft(lessonId, serializedState);
      return serializedState;
    },
  });

  return {
    editorState,
    isLoading: isEditorLoading,
    isError,
    saveEditorState: async (serializedState: SerializedDocument) => {
      await mutation.mutateAsync(serializedState);
    },
    isSaving: mutation.isPending,
  };
};
