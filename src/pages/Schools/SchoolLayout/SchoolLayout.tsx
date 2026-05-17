import { useMemo, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { Box, Drawer, GlobalStyles, useMediaQuery } from '@mui/material';
import AdminPanelTopBar from '../../AdminPanel/AdminPanelLayout/AdminPanelTopBar';
import {
  drawerPaperSx,
  drawerRootSx,
  layoutRootSx,
  mainContentSx,
} from '../../AdminPanel/AdminPanelLayout/AdminPanelLayout.styles';
import { adminPanelCommonStyles } from '../../AdminPanel/AdminPanelLayout/AdminPanelCommon.styles';
import SchoolDrawerContent from './SchoolDrawerContent';

const SchoolLayout = () => {
  const { schoolPublicId = '' } = useParams();
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width:980px)');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const schoolName =
    (location.state as { schoolName?: string } | null)?.schoolName ??
    (schoolPublicId ? `Школа ${schoolPublicId}` : 'Школа');

  const pageTitle = useMemo(() => {
    if (location.pathname.includes('/files')) {
      return 'Файлы';
    }

    if (location.pathname.includes('/chats')) {
      return 'Чаты';
    }

    return 'Обзор';
  }, [location.pathname]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Box sx={layoutRootSx}>
      <GlobalStyles styles={adminPanelCommonStyles} />
      <AdminPanelTopBar
        isDesktop={isDesktop}
        pageTitle={`${schoolName} · ${pageTitle}`}
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
        <SchoolDrawerContent
          schoolPublicId={schoolPublicId}
          schoolName={schoolName}
          pathname={location.pathname}
          onCloseMenu={closeMenu}
        />
      </Drawer>

      <Box component="main" sx={mainContentSx(isDesktop)}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default SchoolLayout;
