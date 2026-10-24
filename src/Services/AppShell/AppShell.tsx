import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import ProfileButton from '@/Services/Profile/components/ProfileButton/ProfileButton';
import DesktopNavigation from './components/DesktopNavigation/DesktopNavigation';
import MobileNavigation from './components/MobileNavigation/MobileNavigation';
import SchoolSwitcher from './components/SchoolSwitcher/SchoolSwitcher';
import { useCurrentSchool } from './hooks/useCurrentSchool';
import { getVisibleNavigationItems } from './utils/getVisibleNavigationItems';
import type { AppNavigationItem } from './AppShell.types';
import { APP_DESKTOP_NAVIGATION_ID, SIDEBAR_COLLAPSE_LABEL, SIDEBAR_EXPAND_LABEL } from './AppShell.const';
import * as S from './AppShell.styles';

export default function AppShell() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarToggleLabel = isSidebarCollapsed ? SIDEBAR_EXPAND_LABEL : SIDEBAR_COLLAPSE_LABEL;
  const location = useLocation();
  const setActiveSchoolPublicId = useGlobalContext((state) => state.auth.setActiveSchoolPublicId);
  const { schoolPublicId, school, capabilities, schoolsQuery } = useCurrentSchool();
  const schools = schoolsQuery.data ?? [];
  const hasSchools = schools.length > 0;
  const navigationItems = schoolPublicId ? getVisibleNavigationItems(capabilities) : [];
  const activeItem = navigationItems.find((item) => (
    location.pathname.includes(`/schools/${schoolPublicId}/${item.path}`)
  ));

  const handleSelectNavigation = (item: AppNavigationItem) => {
    if (schoolPublicId) {
      navigate(`/app/schools/${schoolPublicId}/${item.path}`);
    }
  };

  const handleSelectSchool = (selectedSchool: NonNullable<typeof school>) => {
    setActiveSchoolPublicId(selectedSchool.schoolPublicId);
    navigate(`/app/schools/${selectedSchool.schoolPublicId}/today`);
  };

  const pageTitle = activeItem?.label
    ?? (location.pathname === '/app/schools' ? 'Мои школы' : undefined)
    ?? (location.pathname === '/app/profile' ? 'Профиль' : undefined)
    ?? school?.schoolName
    ?? 'LearnForge';

  return (
    <Box sx={isSidebarCollapsed ? S.collapsedRootSx : S.rootSx}>
      <Box component="aside" sx={S.sidebarSx}>
        <Box component={Link} to="/app" sx={isSidebarCollapsed ? S.collapsedBrandSx : S.brandSx}>
          <Box sx={S.logoFrameSx}>
            <Box component="img" src="/brand-mark.png" alt="" sx={S.logoSx} />
          </Box>
        </Box>

        {hasSchools && (
          <Box sx={S.schoolSwitcherWrapSx}>
            <SchoolSwitcher
              schools={schools}
              currentSchool={school}
              iconOnly={isSidebarCollapsed}
              onSelectSchool={handleSelectSchool}
              onOpenSchoolList={() => navigate('/app/schools')}
            />
          </Box>
        )}

        <Box sx={S.navigationSx}>
          <DesktopNavigation
            items={navigationItems}
            activeItemId={activeItem?.id}
            collapsed={isSidebarCollapsed}
            onSelect={handleSelectNavigation}
          />
        </Box>

        <Box sx={S.sidebarFooterSx}>
          <Tooltip title={sidebarToggleLabel} placement="right">
            <IconButton
              aria-label={sidebarToggleLabel}
              aria-expanded={!isSidebarCollapsed}
              aria-controls={APP_DESKTOP_NAVIGATION_ID}
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              sx={S.sidebarToggleSx}
            >
              {isSidebarCollapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box component="header" sx={S.topbarSx}>
        <Box sx={S.mobileBrandSx}>
          <Box sx={S.logoFrameSx}>
            <Box component="img" src="/brand-mark.png" alt="" sx={S.logoSx} />
          </Box>
          {hasSchools && (
            <SchoolSwitcher
              schools={schools}
              currentSchool={school}
              compact
              onSelectSchool={handleSelectSchool}
              onOpenSchoolList={() => navigate('/app/schools')}
            />
          )}
        </Box>
        <Typography component="h1" sx={S.titleSx}>{pageTitle}</Typography>
        <ProfileButton />
      </Box>

      <Box component="main" sx={S.mainSx}>
        <Box sx={S.contentSx}>
          <Outlet />
        </Box>
      </Box>

      {schoolPublicId && (
        <MobileNavigation
          items={navigationItems}
          activeItemId={activeItem?.id}
          onSelect={handleSelectNavigation}
        />
      )}
    </Box>
  );
}
