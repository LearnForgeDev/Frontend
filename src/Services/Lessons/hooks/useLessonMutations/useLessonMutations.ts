import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesEndpoints } from '@/Endpoints/files.endpoints';
import { useSchoolId } from '@/Services/Lessons/hooks/useSchoolId/useSchoolId';
import { apiFileToLesson } from '@/Endpoints/files.types';
import type { AppError } from '@/Endpoints/factory';
import type {
  CreateLessonVars,
  RenameLessonVars,
  DeleteLessonVars,
} from '@/Services/Lessons/hooks/useLessonMutations/useLessonMutations.types';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';

function buildLessonFileName(title: string, lessonId: string, status: Lesson['status']): string {
  return `lesson::${encodeURIComponent(title)}::${lessonId}::${status}.lesson`;
}

function buildInitialContent(title: string): string {
  return JSON.stringify({
    root: {
      children: [{ children: [{ detail: 0, format: 0, mode: 'normal',
        style: '', text: title, type: 'text', version: 1 }],
        direction: 'ltr', format: '', indent: 0,
        type: 'paragraph', version: 1 }],
      direction: 'ltr', format: '', indent: 0,
      type: 'root', version: 1
    }
  });
}

export function useLessonMutations() {
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();

  const createLesson = useMutation<Lesson, AppError, CreateLessonVars>({
    mutationFn: async ({ title, folderId }: CreateLessonVars): Promise<Lesson> => {
      const lessonId = crypto.randomUUID();
      const status: Lesson['status'] = 'draft';
      const content = buildInitialContent(title);
      const blob = new Blob([content], { type: 'application/json' });
      const fileName = buildLessonFileName(title, lessonId, status);

      const { uploadUrl, storageKey } = await filesEndpoints.getPresignedUpload(schoolId, {
        fileName, sizeBytes: blob.size,
      });
      await filesEndpoints.uploadFileDirect(uploadUrl, content);
      const apiFile = await filesEndpoints.completeUpload(schoolId, {
        storageKey, fileName, sizeBytes: blob.size,
      });

      const lesson = apiFileToLesson(apiFile);
      // folderId is client-side only — patch it in since the API has no folder concept
      return { ...lesson, folderId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', schoolId] });
    },
  });

  const deleteLesson = useMutation<void, AppError, DeleteLessonVars, { previousData: Lesson[] | undefined }>({
    mutationFn: ({ id }) => filesEndpoints.deleteFile(schoolId, id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['lessons', schoolId] });
      const previousData = queryClient.getQueryData<Lesson[]>(['lessons', schoolId]);

      if (previousData) {
        queryClient.setQueryData<Lesson[]>(['lessons', schoolId], (old) => {
          if (!old) return old;
          return old.filter((lesson) => lesson.id !== id);
        });
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['lessons', schoolId], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', schoolId] });
    },
  });

  // TODO: replace with PATCH /api/ApiFiles/{id}/rename when endpoint exists
  const renameLesson = useMutation<void, AppError, RenameLessonVars>({
    mutationFn: async ({ id, title }) => {
      const content = await filesEndpoints.getFileContent(schoolId, id);
      await filesEndpoints.deleteFile(schoolId, id);

      const status: Lesson['status'] = 'draft';
      const blob = new Blob([content], { type: 'application/json' });
      const fileName = buildLessonFileName(title, id, status);

      const { uploadUrl, storageKey } = await filesEndpoints.getPresignedUpload(schoolId, {
        fileName, sizeBytes: blob.size,
      });
      await filesEndpoints.uploadFileDirect(uploadUrl, content);
      await filesEndpoints.completeUpload(schoolId, {
        storageKey, fileName, sizeBytes: blob.size,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', schoolId] });
    },
  });

  return {
    createLesson,
    deleteLesson,
    renameLesson,
  };
}
