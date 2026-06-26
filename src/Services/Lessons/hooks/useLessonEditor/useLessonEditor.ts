import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { lessonsEndpoints } from '@/Endpoints';
import { filesEndpoints } from '@/Endpoints';
import type { UseLessonEditorProps, UseLessonEditorReturn } from './useLessonEditor.types';

export const useLessonEditor = ({ lessonId }: UseLessonEditorProps): UseLessonEditorReturn => {
  const queryClient = useQueryClient();
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
      if (!fileId) return null;
      const content = await filesEndpoints.getFileContent(schoolPublicId, fileId);
      return typeof content === 'string' ? JSON.parse(content) : content;
    },
    enabled: Boolean(lessonId && schoolPublicId && fileId),
  });

  const mutation = useMutation({
    mutationFn: async (serializedState: unknown) => {
      if (!schoolPublicId) throw new Error('Missing schoolPublicId');
      if (!fileId) throw new Error('No lesson file ID associated');
      
      const fileContent = JSON.stringify(serializedState);
      const fileBlob = new Blob([fileContent], { type: 'application/json' });
      const presignDto = {
         fileName: lesson?.lessonJsonFile?.fileName || 'lesson.json',
         sizeBytes: fileBlob.size
      };
      
      const presignResponse = await filesEndpoints.getPresignedUpload(schoolPublicId, presignDto);
      await filesEndpoints.uploadFileDirect(presignResponse.uploadUrl, fileBlob, 'application/json');
      await filesEndpoints.completeUpload(schoolPublicId, {
        storageKey: presignResponse.storageKey,
        fileName: presignDto.fileName,
        sizeBytes: presignDto.sizeBytes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    editorState,
    isLoading: isEditorLoading,
    isError,
    saveEditorState: async (serializedState: unknown) => {
      await mutation.mutateAsync(serializedState);
    },
    isSaving: mutation.isPending,
  };
};
