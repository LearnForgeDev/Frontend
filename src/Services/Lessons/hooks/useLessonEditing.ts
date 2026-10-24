import { useState } from 'react';
import type { SerializedDocument } from '@lexical/file';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useToast } from '@/Storage/useToastStore';
import { useSaveLesson } from './useSaveLesson';
import { clearSavedLessonDraft, readLessonDraft, removeLessonDraft, writeLessonDraft } from './useLessonEditor/useLessonEditor.utils';
import type { Lesson } from '../components/FileManager/FileManager.types';

export function useLessonEditing(schoolPublicId: string, lesson: Lesson, isEditMode: boolean) {
  const userPublicId = useGlobalContext(state => state.auth.user?.userPublicId) ?? '';
  const scope = { schoolPublicId, lessonId: lesson.id, userPublicId };
  const [restoredDraft] = useState(() => isEditMode ? readLessonDraft(scope) : undefined);
  const [storageKey, setStorageKey] = useState(restoredDraft ? restoredDraft.storageKey : lesson.lessonJsonFile?.storageKey);
  const [status, setStatus] = useState<'saved' | 'draft' | 'error'>(restoredDraft ? 'draft' : 'saved');
  const [storageFailed, setStorageFailed] = useState(false);
  const save = useSaveLesson(schoolPublicId, lesson.id);
  const toast = useToast();
  const hasConflict = isEditMode && storageKey !== lesson.lessonJsonFile?.storageKey;

  const remember = (document: SerializedDocument) => {
    try {
      writeLessonDraft(scope, document, storageKey);
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
    if (save.isSaving || hasConflict) return;
    remember(document);
    try {
      const saved = await save.mutateAsync({ title: lesson.title, content: document, expectedStorageKey: storageKey });
      setStorageKey(saved.lessonJsonFile?.storageKey);
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

  const loadCurrentVersion = () => {
    try {
      removeLessonDraft(scope);
      window.location.reload();
    } catch {
      toast.error('Не удалось открыть актуальную версию. Попробуйте ещё раз.');
    }
  };

  return { restoredDraft: restoredDraft?.document, status, storageFailed, hasConflict, loadCurrentVersion, recordDraft, saveDocument, isSaving: save.isSaving };
}
