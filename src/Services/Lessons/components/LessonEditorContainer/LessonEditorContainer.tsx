import { Suspense, lazy } from 'react';
import { Alert } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import type { SerializedDocument } from '@lexical/file';
import type { Lesson } from '../FileManager/FileManager.types';
import { useLessonEditing } from '../../hooks/useLessonEditing';
import { isLessonDocumentEmpty } from '../../hooks/useLessonEditor/useLessonEditor.utils';

const TextEditor = lazy(() => import('../TextEditor/TextEditor'));

interface LessonEditorContainerProps {
  schoolPublicId: string;
  lesson: Lesson;
  document: SerializedDocument;
  isEditMode: boolean;
}

export default function LessonEditorContainer({ schoolPublicId, lesson, document, isEditMode }: LessonEditorContainerProps) {
  const view = useLessonEditing(schoolPublicId, lesson, isEditMode);
  if (!isEditMode && isLessonDocumentEmpty(document)) return <Alert severity="info">В уроке пока нет материалов.</Alert>;
  return <>
    {view.storageFailed && <Alert severity="warning">Не удалось сохранить черновик на устройстве. Сохраните урок перед выходом.</Alert>}
    <Suspense fallback={<ClipLoader color="var(--app-primary)" aria-label="Загрузка редактора" />}>
      <TextEditor
        id={lesson.id}
        isEditMode={isEditMode}
        editorState={view.restoredDraft ?? document}
        isSaving={view.isSaving}
        saveStatus={view.status}
        onDraft={view.recordDraft}
        onSave={view.saveDocument}
      />
    </Suspense>
  </>;
}
