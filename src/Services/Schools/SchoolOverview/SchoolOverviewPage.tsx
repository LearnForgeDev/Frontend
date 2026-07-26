import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { cardGridSx, headerRowSx, helperTextSx, infoCardSx, pageSx } from './SchoolOverviewPage.styles';

import { ScheduleDashboardWidget } from '@/Services/Scheduling/ScheduleDashboardWidget';

const SchoolOverviewPage = () => {
  const { schoolPublicId } = useParams();

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

        {schoolPublicId && <ScheduleDashboardWidget />}
      </Box>
    </Box>
  );
};

export default SchoolOverviewPage;
