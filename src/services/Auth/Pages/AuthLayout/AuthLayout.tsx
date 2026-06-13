import { Box, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { AuthFlowProvider } from '../../contexts/AuthFlowContext';
import * as S from './AuthLayout.styles';

function AuthLayoutContent() {
  return (
    <Box sx={S.container}>
      <Paper elevation={3} sx={S.paper}>
        <Outlet />
      </Paper>
    </Box>
  );
}

export default function AuthLayout() {
  return (
    <AuthFlowProvider>
      <AuthLayoutContent />
    </AuthFlowProvider>
  );
}
