import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { cardGridSx, headerRowSx, helperTextSx, infoCardSx, pageSx } from './SchoolOverviewPage.styles';
import { InviteTokenWidget } from './Components/InviteTokenWidget';
import { ScheduleDashboardWidget } from '@/Services/Scheduling/ScheduleDashboardWidget';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';

const SchoolOverviewPage = () => {
  const { schoolPublicId } = useParams();
  const user = useGlobalContext((s) => s.auth.user);
  
  const currentRole = user?.roles.find((r) => r.schoolId === user.activeSchoolId)?.role;
  const isStudent = currentRole === 0;

  return (
    <Box sx={pageSx} className="admin-page">
      <Box sx={headerRowSx}>
        <Box>
          <Typography component="h1" className="admin-page-title">
            Обзор школы
          </Typography>
          <Typography className="admin-page-description">
            Управляйте файлами, чатами и доступом внутри школы.
          </Typography>
        </Box>
      </Box>

      <Box sx={cardGridSx}>
        <Box className="admin-card" sx={infoCardSx}>
          <Typography component="h3" sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
            Идентификатор школы
          </Typography>
          <Typography sx={helperTextSx}>{schoolPublicId ?? 'Не задано'}</Typography>
        </Box>
        {!isStudent && schoolPublicId && (
          <InviteTokenWidget schoolPublicId={schoolPublicId} />
        )}
        {schoolPublicId && <ScheduleDashboardWidget />}
      </Box>
    </Box>
  );
};

export default SchoolOverviewPage;
