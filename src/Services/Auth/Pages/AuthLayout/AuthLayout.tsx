import { Box, Paper, Typography } from '@mui/material';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import { Navigate, Outlet } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { AuthFlowProvider } from '../../contexts/AuthFlowContext';
import * as S from './AuthLayout.styles';

export default function AuthLayout() {
  const isAuthenticated = useGlobalContext((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <AuthFlowProvider>
      <Box sx={S.pageSx}>
        <Box component="section" sx={S.introSx}>
          <Box sx={S.brandSx}>
            <Box sx={S.logoFrameSx}>
              <Box component="img" src="/brand-mark.png" alt="" sx={S.logoSx} />
            </Box>
            LearnForge
          </Box>
          <Box sx={S.introContentSx}>
            <Typography component="p" sx={S.eyebrowSx}>Рабочее пространство преподавателя</Typography>
            <Typography component="h1" sx={S.heroTitleSx}>
              Всё для занятия — в одном спокойном месте
            </Typography>
            <Typography sx={S.heroTextSx}>
              Планируйте встречи, готовьте уроки и оставайтесь на связи со школой.
            </Typography>
            <Box sx={S.featureListSx}>
              <Box sx={S.featureSx}><CalendarMonthRoundedIcon />Расписание без лишних действий</Box>
              <Box sx={S.featureSx}><AutoStoriesRoundedIcon />Уроки и материалы рядом</Box>
              <Box sx={S.featureSx}><Groups2RoundedIcon />Школа всегда под рукой</Box>
            </Box>
          </Box>
        </Box>

        <Box component="main" sx={S.formPaneSx}>
          <Paper elevation={0} sx={S.paperSx}>
            <Outlet />
          </Paper>
        </Box>
      </Box>
    </AuthFlowProvider>
  );
}
