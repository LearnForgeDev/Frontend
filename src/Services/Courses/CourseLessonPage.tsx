import { Alert, Box, Button, IconButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import ErrorBoundary from '@/Assets/Components/ErrorBoundary/ErrorBoundary';
import CourseLessonContent from './components/CourseLessonContent/CourseLessonContent';
import { useCourseLesson } from './hooks/useCourseLesson';
import { getCoursePath } from './utils/coursePath';
import { lessonBackSx, lessonHeaderSx, lessonPageSx, lessonStatusSx, lessonTitleSx } from './CourseLessonPage.styles';

export default function CourseLessonPage() {
  const { schoolPublicId = '', coursePublicId = '', lessonId = '' } = useParams();
  const { course, lesson, content, isLoading, isError, isRetrying, retry, timingError } = useCourseLesson(schoolPublicId, coursePublicId, lessonId);

  return (
    <Box className="admin-page" sx={lessonPageSx}>
      <Box component="header" sx={lessonHeaderSx}>
        <IconButton component={Link} to={getCoursePath(schoolPublicId, coursePublicId)} sx={lessonBackSx} aria-label="К курсу" title="К курсу"><ArrowBack /></IconButton>
        <Box sx={{ minWidth: 0 }}>
          <Typography className="admin-page-description">{course?.title}</Typography>
          <Typography component="h1" sx={lessonTitleSx}>{lesson?.title ?? 'Урок'}</Typography>
          {lesson?.completionRule === 2 && lesson.requiredSeconds !== null && <Typography variant="body2" color="text.secondary">{lesson.isCompleted ? 'Шаг пройден' : `Открыто: ${Math.floor(lesson.elapsedSeconds / 60)} из ${Math.ceil(lesson.requiredSeconds / 60)} мин.`}</Typography>}
        </Box>
      </Box>
      {timingError && <Alert severity="warning">Не удалось сохранить время. Повторяем автоматически.</Alert>}
      {isLoading ? (
        <Box sx={lessonStatusSx} role="status"><ClipLoader color="var(--admin-primary)" />Загрузка урока…</Box>
      ) : isError ? (
        <Alert severity="error" action={<Button color="inherit" disabled={isRetrying} onClick={() => void retry()}>Повторить</Button>}>
          Не удалось загрузить урок. Попробуйте ещё раз.
        </Alert>
      ) : !lesson ? (
        <Alert severity="info">Этот урок недоступен в курсе.</Alert>
      ) : content ? (
        <ErrorBoundary key={`${coursePublicId}/${lessonId}`}>
          <CourseLessonContent lessonId={lessonId} content={content} />
        </ErrorBoundary>
      ) : null}
    </Box>
  );
}
