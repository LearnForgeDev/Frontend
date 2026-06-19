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
import { useSchoolInfo } from '@/Services/Schools/hooks/useSchoolInfo';
import { useGlobalContext } from '@/Storage/Context/useGlobalContext';
import { ChatProvider } from '@/Storage/Context/useChatContext';
import ChatWidget from '@/Services/Chat/components/ChatWidget/ChatWidget';

const SchoolLayout = () => {
  const { schoolPublicId = '' } = useParams();
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width:980px)');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const schoolId = useGlobalContext((s) => s.auth.user?.activeSchoolId) || 0;
  const { school } = useSchoolInfo(schoolPublicId);

  // Resolve the real name from the endpoint (source of truth, survives reloads),
  // falling back to the name passed via router state for instant render when
  // navigating from the list, then a neutral placeholder — never the raw UUID.
  const stateSchoolName = (location.state as { schoolName?: string } | null)?.schoolName;
  const schoolName = school?.name ?? stateSchoolName ?? 'Школа';

  const pageTitle = useMemo(() => {
    return 'Обзор';
  }, [location.pathname]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <ChatProvider>
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
        
        {schoolId > 0 && schoolPublicId && (
          <ChatWidget schoolId={schoolId} schoolPublicId={schoolPublicId} />
        )}
      </Box>
    </ChatProvider>
  );
};

export default SchoolLayout;