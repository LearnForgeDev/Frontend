import { Box, Typography } from '@mui/material';
import ErrorBoundary from '@/Assets/Components/ErrorBoundary/ErrorBoundary';
import { LessonsProvider } from '@/Storage/Context/LessonsContext';
import FileManager from '@/Services/Lessons/components/FileManager/FileManager';
import './LessonsMainPage.css';

interface LessonsMainPageProps {
  onOpenLesson?: (id: string, title: string) => void;
}

function LessonsMainPage({ onOpenLesson }: LessonsMainPageProps) {
  return (
    <Box className="lessons-main-page" sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
      <Box component="header" sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Мои уроки
        </Typography>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, height: '100%' }}>
        <FileManager onOpenLesson={onOpenLesson} />
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