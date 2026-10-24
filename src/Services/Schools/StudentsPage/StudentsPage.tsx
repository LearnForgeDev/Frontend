import { Box, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { InviteTokenWidget } from '../SchoolOverview/Components/InviteTokenWidget';
import InviteList from './Components/InviteList';
import { StudentsTable } from './Components/StudentsTable';
import { pageSx, headerRowSx, cardGridSx, pageTitleSx, sectionTitleSx } from './StudentsPage.styles';

export default function StudentsPage() {
  const navigate = useNavigate();
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();

  return (
    <Box sx={pageSx}>
      <Box sx={headerRowSx}>
        <Box>
          <Typography component="h1" sx={pageTitleSx}>
            Ученики
          </Typography>
          <Typography color="text.secondary">
            Участники школы и приглашения для новых учеников.
          </Typography>
        </Box>
      </Box>

      <Box sx={cardGridSx}>
        <InviteTokenWidget key={schoolPublicId} schoolPublicId={schoolPublicId} />
      </Box>

      <InviteList key={schoolPublicId} schoolPublicId={schoolPublicId} />

      <Box>
        <Typography component="h2" sx={sectionTitleSx}>
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
