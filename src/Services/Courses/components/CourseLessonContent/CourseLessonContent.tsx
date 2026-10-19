import { lazy, Suspense } from 'react';
import { Box } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import type { SerializedDocument } from '@lexical/file';
import { lessonContentSx } from './CourseLessonContent.styles';

const TextEditor = lazy(() => import('@/Services/Lessons/components/TextEditor/TextEditor'));

interface CourseLessonContentProps {
  lessonId: string;
  content: SerializedDocument;
}

export default function CourseLessonContent({ lessonId, content }: CourseLessonContentProps) {
  return (
    <Box sx={lessonContentSx}>
      <Suspense fallback={<ClipLoader color="var(--admin-primary)" aria-label="Загрузка урока" />}>
        <TextEditor key={lessonId} id={lessonId} isEditMode={false} editorState={content} />
      </Suspense>
    </Box>
  );
}
