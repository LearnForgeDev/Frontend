import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { InviteTokenWidget } from '../SchoolOverview/Components/InviteTokenWidget';
import { StudentsTable } from './Components/StudentsTable';
import { pageSx, headerRowSx, cardGridSx } from './StudentsPage.styles';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';

const StudentsPage = () => {
  const { schoolPublicId } = useParams();
  const user = useGlobalContext((s) => s.auth.user);
  
  const currentRole = user?.roles.find((r) => r.schoolId === user.activeSchoolId)?.role;
  const isStudent = currentRole === 0;

  return (
    <Box sx={pageSx} className="admin-page">
      <Box sx={headerRowSx}>
        <Box>
          <Typography component="h1" className="admin-page-title">
            Студенты
          </Typography>
          <Typography className="admin-page-description">
            Управляйте студентами и приглашениями.
          </Typography>
        </Box>
      </Box>

      <Box sx={cardGridSx}>
        {!isStudent && schoolPublicId && (
          <InviteTokenWidget schoolPublicId={schoolPublicId} />
        )}
      </Box>

      {schoolPublicId && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Список студентов
          </Typography>
          <StudentsTable schoolPublicId={schoolPublicId} />
        </Box>
      )}
    </Box>
  );
};

export default StudentsPage;
