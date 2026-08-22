import { Box, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { InviteTokenWidget } from '../SchoolOverview/Components/InviteTokenWidget';
import { StudentsTable } from './Components/StudentsTable';
import { pageSx, headerRowSx, cardGridSx } from './StudentsPage.styles';

export default function StudentsPage() {
  const navigate = useNavigate();
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();

  return (
    <Box sx={pageSx}>
      <Box sx={headerRowSx}>
        <Box>
          <Typography component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 800 }}>
            Ученики
          </Typography>
          <Typography color="text.secondary">
            Участники школы и приглашения для новых учеников.
          </Typography>
        </Box>
      </Box>

      <Box sx={cardGridSx}>
        <InviteTokenWidget schoolPublicId={schoolPublicId} />
      </Box>

      <Box>
        <Typography component="h2" sx={{ mb: 2, fontSize: '1.2rem', fontWeight: 800 }}>
          Все ученики
        </Typography>
        <StudentsTable
          schoolPublicId={schoolPublicId}
          onOpenChat={(studentPublicId) => navigate(
            `../chats?user=${encodeURIComponent(studentPublicId)}`,
            { relative: 'path' },
          )}
        />
      </Box>
    </Box>
  );
}
