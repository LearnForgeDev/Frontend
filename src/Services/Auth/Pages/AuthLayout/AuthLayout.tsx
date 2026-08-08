import { Box, Paper } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

import { AuthFlowProvider } from '../../contexts/AuthFlowContext';
import * as S from './AuthLayout.styles';
import { useEffect } from 'react';
import { getRedirectPath } from './AuthLayout.utils';

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
    const fromLocation = location.state?.from as string | undefined;

    if (user) {
      navigate(getRedirectPath({
        fromLocation,
        selectedSchool: user.activeSchoolPublicId
      }));
    }
  }, [location.state?.from, navigate, user]);

  return (
    <AuthFlowProvider>
      <AuthLayoutContent />
    </AuthFlowProvider>
  );
}
