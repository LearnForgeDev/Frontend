import React, { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, Drawer, GlobalStyles, useMediaQuery } from "@mui/material";
import { serviceRegistry } from "../../../services/ServiceRegistry";
import type { ServiceManifest } from "../../../types/serviceTypes.ts";
import AdminPanelDrawerContent from './AdminPanelDrawerContent';
import AdminPanelTopBar from './AdminPanelTopBar';
import { drawerPaperSx, drawerRootSx, layoutRootSx, mainContentSx } from './AdminPanelLayout.styles';
import { adminPanelCommonStyles } from './AdminPanelCommon.styles';

const AdminPanelLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [services] = useState<ServiceManifest[]>(serviceRegistry.getAll());
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width:980px)");

  const pageTitle = useMemo(() => {
    if (location.pathname.includes('/marketplace')) {
      return 'Marketplace';
    }

    if (location.pathname.includes('/services/')) {
      const [route] = location.pathname.split('/services/');
      const service = services.find((item) => item.adminRoute === route);
      return service?.name ?? 'Service';
    }

    return 'Dashboard';
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
        variant={isDesktop ? 'permanent' : 'temporary'}
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
