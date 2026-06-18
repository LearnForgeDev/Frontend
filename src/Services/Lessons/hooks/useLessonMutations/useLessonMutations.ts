import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints/lessons.endpoints';
import type { AppError } from '@/Endpoints/factory';
import type {
  CreateLessonVars,
  RenameLessonVars,
  DeleteLessonVars,
  CreateFolderVars,
  RenameFolderVars,
  DeleteFolderVars,
} from '@/Services/Lessons/hooks/useLessonMutations/useLessonMutations.types';
import type { Lesson, LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';
import { useParams } from 'react-router-dom';

export function useLessonMutations() {
  const queryClient = useQueryClient();
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();

  if (!schoolPublicId) {
    throw new Error('useLessonMutations must have a valid schoolPublicId');
  }

  const createLesson = useMutation<Lesson, AppError, CreateLessonVars>({
    mutationFn: async ({ title, folderId }: CreateLessonVars): Promise<Lesson> => {
      return lessonsEndpoints.createLesson(schoolPublicId, { title, folderId });
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

  const renameLesson = useMutation<Lesson, AppError, RenameLessonVars>({
    mutationFn: async ({ id, title }) => {
      return lessonsEndpoints.updateLesson(schoolPublicId, id, { title });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', schoolPublicId] });
    },
  });

  const createFolder = useMutation<LessonFolder, AppError, CreateFolderVars>({
    mutationFn: async ({ name, parentId, color }) => {
      return lessonsEndpoints.createFolder(schoolPublicId, { name, parentId, color });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonFolders', schoolPublicId] });
    },
  });

  const deleteFolder = useMutation<void, AppError, DeleteFolderVars, { previousData: LessonFolder[] | undefined }>({
    mutationFn: ({ id }) => lessonsEndpoints.deleteFolder(schoolPublicId, id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['lessonFolders', schoolPublicId] });
      const previousData = queryClient.getQueryData<LessonFolder[]>(['lessonFolders', schoolPublicId]);

      if (previousData) {
        queryClient.setQueryData<LessonFolder[]>(['lessonFolders', schoolPublicId], (old) => {
          if (!old) return old;
          return old.filter((folder) => folder.id !== id);
        });
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['lessonFolders', schoolPublicId], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonFolders', schoolPublicId] });
    },
  });

  const renameFolder = useMutation<LessonFolder, AppError, RenameFolderVars>({
    mutationFn: async ({ id, name }) => {
      return lessonsEndpoints.updateFolder(schoolPublicId, id, { name });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonFolders', schoolPublicId] });
    },
  });

  return {
    createLesson,
    deleteLesson,
    renameLesson,
    createFolder,
    deleteFolder,
    renameFolder,
  };
}
