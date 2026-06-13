import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, GlobalStyles, useMediaQuery } from '@mui/material';
import { serviceRegistry } from '@/Services/ServiceRegistry';
import type { ServiceManifest } from '@/Assets/Types/serviceTypes';
import AdminPanelDrawerContent from './AdminPanelDrawerContent';
import AdminPanelTopBar from './AdminPanelTopBar';
import {
  drawerPaperSx,
  drawerRootSx,
  layoutRootSx,
  mainContentSx,
} from "./AdminPanelLayout.styles";
import { adminPanelCommonStyles } from './AdminPanelCommon.styles';
import { useUser } from '@/Storage/Context/UserContext';

const AdminPanelLayout: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [services] = useState<ServiceManifest[]>(serviceRegistry.getAll());
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width:980px)");

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  const pageTitle = useMemo(() => {
    if (location.pathname.includes("/marketplace")) {
      return "Маркетплейс";
    }

    if (location.pathname.includes("/services/")) {
      const [, servicePath = ""] = location.pathname.split("/services/");
      const [route] = servicePath.split("/");
      const service = services.find((item) => item.adminRoute === route);
      return service?.name ?? "Сервис";
    }

    return "Панель управления";
  }, [location.pathname, services]);

  const closeMenu = () => setIsMenuOpen(false);

  const drawerContent = (
    <AdminPanelDrawerContent
      services={services}
      pathname={location.pathname}
      onCloseMenu={closeMenu}
    />
  );

  return (
    <Box sx={layoutRootSx}>
      <GlobalStyles styles={adminPanelCommonStyles} />
      <AdminPanelTopBar
        isDesktop={isDesktop}
        pageTitle={pageTitle}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      />

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop || isMenuOpen}
        onClose={closeMenu}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { sx: drawerPaperSx } }}
        sx={drawerRootSx}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={mainContentSx(isDesktop)}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminPanelLayout;