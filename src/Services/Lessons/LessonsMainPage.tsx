import { Box, Typography, Button, Skeleton, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useLessons } from '@/Services/Lessons/hooks/useLessons/useLessons';
import { useCreateLessonFlow } from '@/Services/Lessons/hooks/useCreateLessonFlow/useCreateLessonFlow';
import { useLessonMutations } from '@/Services/Lessons/hooks/useLessonMutations/useLessonMutations';
import LessonCard from '@/Services/Lessons/components/LessonCard/LessonCard';
import ErrorBoundary from '@/Assets/Components/ErrorBoundary/ErrorBoundary';
import { LessonsProvider } from '@/Storage/LessonsContext/LessonsContext.tsx';
import './LessonsMainPage.css';

interface LessonsMainPageProps {
  onOpenLesson?: (id: string, title: string) => void;
}

function LessonsMainPage({ onOpenLesson }: LessonsMainPageProps) {
  const navigate = useNavigate();
  const { lessons, isLoading, isError, refetch } = useLessons();
  const mutations = useLessonMutations();

  const handleOpenLesson = (id: string, title: string) => {
    if (onOpenLesson) {
      onOpenLesson(id, title);
    } else {
      navigate(`/Lessons/${id}?edit=true`, { state: { id, title } });
    }
  };

  const { handleCreateLesson, isCreating } = useCreateLessonFlow({
    onSuccess: (id, title) => handleOpenLesson(id, title),
  });

  return (
    <Box className="lessons-main-page" sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
      <Box component="header" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Мои уроки
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleCreateLesson()}
          disabled={isCreating}
        >
          Создать урок
        </Button>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, height: '100%' }}>
        {isLoading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : isError ? (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => refetch()}>Повторить</Button>}
          >
            Не удалось загрузить уроки.
          </Alert>
        ) : !lessons?.length ? (
          <Typography variant="body1" color="text.secondary">
            У вас пока нет уроков.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                selected={false}
                onClick={() => {}}
                onOpen={() => handleOpenLesson(lesson.id, lesson.title)}
                onRename={() => {}} // No implementation yet in the original either
                onMove={() => {}}
                onDelete={() => mutations.deleteLesson.mutate({ id: lesson.id })}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function LessonsMainPageWithErrorBoundary({ onOpenLesson }: LessonsMainPageProps) {
  return (
    <ErrorBoundary>
      <LessonsProvider>
        <LessonsMainPage onOpenLesson={onOpenLesson} />
      </LessonsProvider>
    </ErrorBoundary>
  );
}