import { useNavigate, useParams } from 'react-router-dom';
import LessonsMainPage from '@/Services/Lessons/LessonsMainPage';
import { Box } from '@mui/material';
import { useCurrentSchool } from '@/Services/AppShell/hooks/useCurrentSchool';

export default function LessonsPage() {
  const navigate = useNavigate();
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const { capabilities } = useCurrentSchool();

  const handleOpenLesson = (id: string, title: string) => {
    navigate(`/app/schools/${schoolPublicId}/lessons/${id}?edit=${capabilities.canTeach}`, {
      state: { id, title },
    });
  };

  return (
    <Box sx={{ height: '100%' }}>
      <LessonsMainPage
        onOpenLesson={handleOpenLesson}
        canManageLessons={capabilities.canTeach}
      />
    </Box>
  );
}
