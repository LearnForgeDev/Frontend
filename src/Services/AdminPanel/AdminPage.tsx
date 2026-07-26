import React, { useEffect } from 'react';
import { Box, GlobalStyles } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminPanelTopBar from '@/Services/AdminPanel/AdminPanelLayout/AdminPanelTopBar';
import { adminPanelCommonStyles } from '@/Services/AdminPanel/AdminPanelLayout/AdminPanelCommon.styles';
import { layoutRootSx } from '@/Services/AdminPanel/AdminPanelLayout/AdminPanelLayout.styles';
import { useUser } from '@/Storage/UserContext/UserContext';
import DashboardHome from '@/Services/AdminPanel/DashboardHome/DashboardHome';
import SchoolsPage from '@/Services/AdminPanel/SchoolsPage/SchoolsPage';

const AdminPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  return (
    <Box sx={layoutRootSx}>
      <GlobalStyles styles={adminPanelCommonStyles} />
      <AdminPanelTopBar
        isDesktop={false}
        hideMenuButton={true}
        pageTitle="Панель управления"
        onToggleMenu={() => { }}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          padding: '5rem 2rem 2rem',
          width: '100%',
          boxSizing: 'border-box',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <DashboardHome />
          <SchoolsPage />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPage;
