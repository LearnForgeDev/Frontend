import type { CourseLessonContentProps } from './CourseLessonContent.type';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { ClipLoader } from 'react-spinners';

import { lessonContentSx } from './CourseLessonContent.styles';

const TextEditor = dynamic(() => import('@/Services/Lessons/components/TextEditor/TextEditor'), {
  ssr: false,
  loading: ({ error }) => {
    if (error) {
      throw error;
    }
    return <ClipLoader color="var(--admin-primary)" aria-label="Загрузка урока" />;
  },
});

export default function CourseLessonContent({ lessonId, content }: CourseLessonContentProps) {
  return (
    <Box sx={lessonContentSx}>
      <TextEditor key={lessonId} id={lessonId} isEditMode={false} editorState={content} />
    </Box>
  );
}
