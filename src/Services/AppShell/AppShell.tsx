import { Avatar, Box, Button, Typography } from '@mui/material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import DesktopNavigation from './components/DesktopNavigation/DesktopNavigation';
import MobileNavigation from './components/MobileNavigation/MobileNavigation';
import SchoolSwitcher from './components/SchoolSwitcher/SchoolSwitcher';
import { useCurrentSchool } from './hooks/useCurrentSchool';
import { getVisibleNavigationItems } from './utils/getVisibleNavigationItems';
import type { AppNavigationItem } from './AppShell.types';
import * as S from './AppShell.styles';

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useGlobalContext((state) => state.auth.user);
  const setActiveSchoolPublicId = useGlobalContext((state) => state.auth.setActiveSchoolPublicId);
  const { schoolPublicId, school, capabilities, schoolsQuery } = useCurrentSchool();
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

  const userInitials = user?.userName.slice(0, 2).toUpperCase() ?? 'LF';

  return (
    <Box sx={S.rootSx}>
      <Box component="aside" sx={S.sidebarSx}>
        <Box component={Link} to="/app" sx={S.brandSx}>
          <Box sx={S.logoFrameSx}>
            <Box component="img" src="/brand-mark.png" alt="" sx={S.logoSx} />
          </Box>
        </Box>

        <Box sx={S.schoolSwitcherWrapSx}>
          <SchoolSwitcher
            schools={schoolsQuery.data ?? []}
            currentSchool={school}
            onSelectSchool={handleSelectSchool}
            onOpenSchoolList={() => navigate('/app/schools')}
          />
        </Box>

        <Box sx={S.navigationSx}>
          <DesktopNavigation
            items={navigationItems}
            activeItemId={activeItem?.id}
            onSelect={handleSelectNavigation}
          />
        </Box>

      </Box>

      <Box component="header" sx={S.topbarSx}>
        <Box sx={S.mobileBrandSx}>
          <Box sx={S.logoFrameSx}>
            <Box component="img" src="/brand-mark.png" alt="" sx={S.logoSx} />
          </Box>
          <SchoolSwitcher
            schools={schoolsQuery.data ?? []}
            currentSchool={school}
            compact
            onSelectSchool={handleSelectSchool}
            onOpenSchoolList={() => navigate('/app/schools')}
          />
        </Box>
        <Typography component="h1" sx={S.titleSx}>{pageTitle}</Typography>
        <Button
          aria-label="Открыть профиль"
          onClick={() => navigate('/app/profile')}
          sx={S.topbarProfileButtonSx}
        >
          <Avatar sx={S.avatarSx}>{userInitials}</Avatar>
          <Box sx={S.topbarProfileTextSx}>
            <Typography sx={S.profileNameSx} noWrap>
              {user?.userName ?? 'Профиль'}
            </Typography>
            <Typography sx={S.profileHintSx}>Профиль</Typography>
          </Box>
        </Button>
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
