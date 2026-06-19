import { useNavigate, useParams } from 'react-router-dom';
import LessonsMainPage from '@/Services/Lessons/LessonsMainPage';
import { Box } from '@mui/material';

export default function LessonsPage() {
  const navigate = useNavigate();
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();

  const handleOpenLesson = (id: string, title: string) => {
    navigate(`/admin/schools/${schoolPublicId}/lessons/${id}?edit=true`, { state: { id, title } });
  };

  return (
    <Box sx={{ height: '100%' }}>
      <LessonsMainPage onOpenLesson={handleOpenLesson} />
    </Box>
  );
}
