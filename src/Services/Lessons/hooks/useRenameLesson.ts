import { useState } from 'react';
import { useToast } from '@/Storage/useToastStore';
import { validateLessonTitle } from '../validation/lessonTitle';
import { useSaveLesson } from './useSaveLesson';
import type { Lesson } from '../components/FileManager/FileManager.types';

export function useRenameLesson(schoolPublicId: string, lesson: Lesson, onClose: () => void) {
  const [title, setTitle] = useState(lesson.title);
  const [error, setError] = useState<string | null>(null);
  const save = useSaveLesson(schoolPublicId, lesson.id);
  const toast = useToast();

  const submit = async () => {
    const validationError = validateLessonTitle(title);
    setError(validationError);
    if (validationError || save.isSaving) return;
    try {
      await save.mutateAsync({ title: title.trim() });
      toast.success('Название сохранено');
      onClose();
    } catch {
      setError('Не удалось сохранить название. Попробуйте ещё раз.');
      toast.error('Не удалось сохранить название урока.');
    }
  };

  return {
    title, error, isSaving: save.isSaving, submit,
    changeTitle: (value: string) => { setTitle(value); setError(null); },
    close: () => { if (!save.isSaving) onClose(); },
  };
}
