import { Suspense, lazy } from 'react';
import { Box, Skeleton } from '@mui/material';
import { useLessonEditor } from '../../hooks/useLessonEditor/useLessonEditor';

const TextEditor = lazy(() => import('../TextEditor/TextEditor'));

export interface LessonEditorContainerProps {
  id: string | number;
  isEditMode: boolean;
}

export default function LessonEditorContainer({
  id,
  isEditMode,
}: LessonEditorContainerProps) {
  const { editorState, isLoading, isError } = useLessonEditor({ lessonId: id });

  if (isLoading) {
    return <SkeletonBox />;
  }

  if (isError) {
    return <Box>Не удалось загрузить содержимое урока.</Box>;
  }

  return (
    <Suspense fallback={<SkeletonBox />}>
      <TextEditor
        isEditMode={isEditMode}
        id={id}
        editorState={editorState}
      />
    </Suspense>
  );
}

function SkeletonBox() {
  return (
    <Box className="editor-input" sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton variant="rectangular" sx={{ width: '50%', margin: '1rem auto', height: '1.5rem', borderRadius: '10px' }} />
      <Skeleton variant="rectangular" sx={{ width: '70%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '100%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '95%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '100%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '85%', borderRadius: '10px', height: '1rem' }} />
    </Box>
  );
}
