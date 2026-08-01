import { Box, Paper } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

import { AuthFlowProvider } from '../../contexts/AuthFlowContext';
import * as S from './AuthLayout.styles';
import { useEffect } from 'react';

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
  const navigate = useNavigate();
  const location = useLocation();
  const user = useGlobalContext((s) => s.auth.user);

  useEffect(() => {
    const fromLocation = location.state?.from;

    if (user) {
      navigate(fromLocation ?? `/admin/schools/${user.activeSchoolPublicId ?? ''}`);
    }
  }, [])

  return (
    <AuthFlowProvider>
      <AuthLayoutContent />
    </AuthFlowProvider>
  );
}
