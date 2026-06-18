import { Box, Typography } from '@mui/material';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import type { viewLessonProps } from '@/Services/Lessons/lessonTypes';
import './LessonIdPage.css';

import LessonEditorContainer from './components/LessonEditorContainer/LessonEditorContainer';

export default function LessonIdPage() {
  // TODO: Добавить проверку на существование lessonId
  // TODO: Добавить проверку на возможность редактирования урока
  // TODO: Добавить подгрузку данных урока по lessonId
  const { id: paramId } = useParams<{id: string}>();
  const locationState = useLocation()?.state as viewLessonProps | null;
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const id = locationState?.id ?? paramId;
  const title = locationState?.title ?? 'Загрузка...';

  return (
    <Box className='lesson-id-page'>
      <Typography
        variant="h1"
        className={`lesson-name ${isEditMode ? 'editable' : ''}`}
        contentEditable={isEditMode}
      >
        {title}
      </Typography>
      {id && (
        <LessonEditorContainer
          isEditMode={isEditMode}
          id={id}
        />
      )}
    </Box>
  );
}
