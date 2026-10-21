import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { filesEndpoints } from '@/Endpoints';
import { useToast } from '@/Storage/useToastStore';
import { useLessonQuery } from '../useLessonQuery';
import type { UseLessonEditorProps } from './useLessonEditor.types';
import { normalizeLessonDocument } from './useLessonEditor.utils';

export const useLessonEditor = ({ lessonId }: UseLessonEditorProps) => {
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();
  const toast = useToast();
  const lessonQuery = useLessonQuery(schoolPublicId, lessonId);
  const lesson = lessonQuery.data;
  const file = lesson?.lessonJsonFile;
  const contentQuery = useQuery({
    queryKey: ['lesson-content', schoolPublicId, String(lessonId), file?.storageKey],
    queryFn: async () => {
      try {
        if (!file) throw new Error('Содержимое урока недоступно');
        const content = await filesEndpoints.getFileContent(schoolPublicId, file.publicId);
        const document = normalizeLessonDocument(typeof content === 'string' ? JSON.parse(content) : content);
        if (!document) throw new Error('Не удалось прочитать урок');
        return document;
      } catch (error) {
        toast.error('Не удалось загрузить содержимое урока.');
        throw error;
      }
    },
    enabled: Boolean(lesson && file),
    networkMode: 'always',
    retry: false,
  });

  return {
    lesson,
    schoolPublicId,
    editorState: contentQuery.data,
    isLoading: lessonQuery.isLoading || contentQuery.isLoading,
    isError: lessonQuery.isError || contentQuery.isError,
    isUnavailable: Boolean(lesson && !file),
    isRetrying: lessonQuery.isFetching || contentQuery.isFetching,
    retry: () => lessonQuery.isError ? lessonQuery.refetch() : contentQuery.refetch(),
  };
};
