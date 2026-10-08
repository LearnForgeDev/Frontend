import { Alert, Box, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import ErrorBoundary from '@/Assets/Components/ErrorBoundary/ErrorBoundary';
import CourseLessonContent from './components/CourseLessonContent/CourseLessonContent';
import { useCourseLesson } from './hooks/useCourseLesson';
import { getCoursePath } from './utils/coursePath';
import { lessonBackSx, lessonPageSx, lessonStatusSx, lessonTitleSx } from './CourseLessonPage.styles';

export default function CourseLessonPage() {
  const { schoolPublicId = '', coursePublicId = '', lessonId = '' } = useParams();
  const { course, lesson, content, isLoading, isError, isRetrying, retry } = useCourseLesson(schoolPublicId, coursePublicId, lessonId);

  return (
    <Box className="admin-page" sx={lessonPageSx}>
      <Button component={Link} to={getCoursePath(schoolPublicId, coursePublicId)} startIcon={<ArrowBack />} sx={lessonBackSx}>
        К курсу
      </Button>
      <Box>
        <Typography className="admin-page-description">{course?.title}</Typography>
        <Typography component="h1" sx={lessonTitleSx}>{lesson?.title ?? 'Урок'}</Typography>
      </Box>
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
