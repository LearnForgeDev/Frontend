import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { headerRowSx, pageSx } from '../SchoolOverview/SchoolOverviewPage.styles';

const SchoolChatsPage = () => {
  const { schoolPublicId } = useParams();

  return (
    <Box sx={pageSx} className="admin-page">
      <Box sx={headerRowSx}>
        <Box>
          <Typography component="h1" className="admin-page-title">
            Чаты школы
          </Typography>
          <Typography className="admin-page-description">
            Общайтесь с учениками и преподавателями.
          </Typography>
        </Box>
      </Box>

      <Box className="admin-card" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Раздел чатов находится в разработке.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          ID школы: {schoolPublicId}
        </Typography>
      </Box>
    </Box>
  );
};

export default SchoolChatsPage;
