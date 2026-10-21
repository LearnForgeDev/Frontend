import { useState } from 'react';
import type { SerializedDocument } from '@lexical/file';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useToast } from '@/Storage/useToastStore';
import { useSaveLesson } from './useSaveLesson';
import { clearSavedLessonDraft, readLessonDraft, writeLessonDraft } from './useLessonEditor/useLessonEditor.utils';
import type { Lesson } from '../components/FileManager/FileManager.types';

export function useLessonEditing(schoolPublicId: string, lesson: Lesson, isEditMode: boolean) {
  const userPublicId = useGlobalContext(state => state.auth.user?.userPublicId) ?? '';
  const scope = { schoolPublicId, lessonId: lesson.id, userPublicId };
  const [restoredDraft] = useState(() => isEditMode ? readLessonDraft(scope) : undefined);
  const [status, setStatus] = useState<'saved' | 'draft' | 'error'>(restoredDraft ? 'draft' : 'saved');
  const [storageFailed, setStorageFailed] = useState(false);
  const save = useSaveLesson(schoolPublicId, lesson.id);
  const toast = useToast();

  const remember = (document: SerializedDocument) => {
    try {
      writeLessonDraft(scope, document);
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  };

  const recordDraft = (document: SerializedDocument) => {
    remember(document);
    setStatus('draft');
  };

  const saveDocument = async (document: SerializedDocument) => {
    if (save.isSaving) return;
    remember(document);
    try {
      await save.mutateAsync({ title: lesson.title, content: document });
      try {
        clearSavedLessonDraft(scope, document);
      } catch {
        setStorageFailed(true);
      }
      setStatus('saved');
      toast.success('Урок сохранён. Изменения доступны ученикам.');
    } catch {
      setStatus('error');
      toast.error('Не удалось сохранить урок. Попробуйте ещё раз.');
    }
  };

  return { restoredDraft, status, storageFailed, recordDraft, saveDocument, isSaving: save.isSaving };
}
