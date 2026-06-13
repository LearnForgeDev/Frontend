import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints/lessons.endpoints';
import type { AppError } from '@/Endpoints/factory';
import type {
  CreateLessonVars,
  UpdateLessonVars,
  DeleteLessonVars,
  CreateFolderVars,
  UpdateFolderVars,
  DeleteFolderVars,
} from '@/Services/Lessons/hooks/useLessonMutations/useLessonMutations.types';
import type { Lesson, LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';

export function useLessonMutations() {
  const queryClient = useQueryClient();

  // 1. Create Lesson
  const createLessonMutation = useMutation<Lesson, AppError, CreateLessonVars>({
    mutationFn: (vars) => lessonsEndpoints.createLesson(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  // 2. Update Lesson (with optimistic updates)
  const updateLessonMutation = useMutation<
    Lesson,
    AppError,
    UpdateLessonVars,
    { previousQueries: Array<[readonly unknown[], unknown]> }
  >({
    mutationFn: ({ id, ...body }) => lessonsEndpoints.updateLesson(id, body),
    onMutate: async (updatedLesson) => {
      await queryClient.cancelQueries({ queryKey: ['lessons'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['lessons'] });

      previousQueries.forEach(([queryKey]) => {
        if (queryKey.includes('folders')) return;

        // If it's a detail query, e.g. ['lessons', id]
        if (queryKey.length === 2 && queryKey[1] === updatedLesson.id) {
          queryClient.setQueryData<Lesson>(queryKey, (old) => {
            if (!old) return old;
            return { ...old, ...updatedLesson };
          });
          return;
        }

        // If it's a list query
        queryClient.setQueryData<Lesson[]>(queryKey, (old) => {
          if (!old) return old;
          return old.map((lesson) =>
            lesson.id === updatedLesson.id ? { ...lesson, ...updatedLesson } : lesson
          );
        });
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  // 3. Delete Lesson (with optimistic updates)
  const deleteLessonMutation = useMutation<
    void,
    AppError,
    DeleteLessonVars,
    { previousQueries: Array<[readonly unknown[], unknown]> }
  >({
    mutationFn: ({ id }) => lessonsEndpoints.deleteLesson(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['lessons'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['lessons'] });

      previousQueries.forEach(([queryKey]) => {
        if (queryKey.includes('folders')) return;

        // If it's a list query
        queryClient.setQueryData<Lesson[]>(queryKey, (old) => {
          if (!old) return old;
          return old.filter((lesson) => lesson.id !== id);
        });
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  // 4. Create Folder
  const createFolderMutation = useMutation<LessonFolder, AppError, CreateFolderVars>({
    mutationFn: (vars) => lessonsEndpoints.createFolder(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  // 5. Update Folder (with optimistic updates)
  const updateFolderMutation = useMutation<
    LessonFolder,
    AppError,
    UpdateFolderVars,
    { previousQueries: Array<[readonly unknown[], unknown]> }
  >({
    mutationFn: ({ id, ...body }) => lessonsEndpoints.updateFolder(id, body),
    onMutate: async (updatedFolder) => {
      await queryClient.cancelQueries({ queryKey: ['lessons'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['lessons', 'folders'] });

      previousQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<LessonFolder[]>(queryKey, (old) => {
          if (!old) return old;
          return old.map((folder) =>
            folder.id === updatedFolder.id ? { ...folder, ...updatedFolder } : folder
          );
        });
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  // 6. Delete Folder (with optimistic updates)
  const deleteFolderMutation = useMutation<
    void,
    AppError,
    DeleteFolderVars,
    { previousQueries: Array<[readonly unknown[], unknown]> }
  >({
    mutationFn: ({ id }) => lessonsEndpoints.deleteFolder(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['lessons'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['lessons', 'folders'] });

      previousQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<LessonFolder[]>(queryKey, (old) => {
          if (!old) return old;
          return old.filter((folder) => folder.id !== id);
        });
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  return {
    createLesson: createLessonMutation,
    updateLesson: updateLessonMutation,
    deleteLesson: deleteLessonMutation,
    createFolder: createFolderMutation,
    updateFolder: updateFolderMutation,
    deleteFolder: deleteFolderMutation,
  };
}
