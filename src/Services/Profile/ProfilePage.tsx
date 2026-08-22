import { useCallback } from 'react';
import { Alert, Box, Paper, Typography } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useUser } from '@/Storage/UserContext/UserContext';
import { useSchools } from '@/Services/AdminPanel/SchoolsPage/hooks/useSchools';
import { useScheduleEvents } from '@/Services/Scheduling/hooks/useScheduleEvents/useScheduleEvents';
import { formatEventFullDateTime } from '@/Services/Scheduling/utils/time.utils';
import { ProfileCard } from './components/ProfileCard/ProfileCard';
import { LessonCard } from './components/LessonCard/LessonCard';
import { PROFILE_PAGE_TEXT } from './ProfilePage.const';
import { formatSchoolRoles, getClosestEvent } from './ProfilePage.utils';
import * as S from './ProfilePage.styles';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useGlobalContext((state) => state.auth.user);
  const logout = useGlobalContext((state) => state.auth.logout);
  const { clearUser } = useUser();
  const schoolsQuery = useSchools();
  const schedule = useScheduleEvents();
  const activeSchool = schoolsQuery.data?.find(
    (school) => school.schoolPublicId === user?.activeSchoolPublicId,
  );
  const closestEvent = getClosestEvent(schedule.events);

  const handleLogout = useCallback(() => {
    logout();
    clearUser();
    navigate('/auth/login', { replace: true });
  }, [clearUser, logout, navigate]);

  if (!user) {
    return (
      <Box sx={S.notAuthContainerSx}>
        <Typography>{PROFILE_PAGE_TEXT.notAuthorized}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={S.pageRootSx}>
      <Box component="header" sx={S.headerSx}>
        <Typography component="h1" sx={S.pageTitleSx}>
          {PROFILE_PAGE_TEXT.title}
        </Typography>
        <Typography sx={S.subtitleSx}>{PROFILE_PAGE_TEXT.subtitle}</Typography>
      </Box>

      <ProfileCard user={user} onLogout={handleLogout} />

      <Box sx={S.contentGridSx}>
        <Paper component="section" elevation={0} sx={S.sectionSx}>
          <Typography component="h2" sx={S.sectionTitleSx}>
            {PROFILE_PAGE_TEXT.schoolsTitle}
          </Typography>

          {schoolsQuery.isError ? (
            <Alert severity="error">{PROFILE_PAGE_TEXT.schoolsError}</Alert>
          ) : schoolsQuery.isLoading ? (
            <Box sx={S.eventEmptySx}>
              <ClipLoader size={28} color="var(--admin-primary)" />
            </Box>
          ) : !schoolsQuery.data?.length ? (
            <Typography sx={S.eventEmptySx}>{PROFILE_PAGE_TEXT.schoolsEmpty}</Typography>
          ) : (
            <Box sx={S.schoolsListSx}>
              {schoolsQuery.data.map((school) => (
                <Box key={school.schoolPublicId} sx={S.schoolRowSx}>
                  <Box sx={S.schoolIconSx}>
                    <SchoolOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography sx={S.schoolNameSx}>{school.schoolName}</Typography>
                    <Typography sx={S.schoolRolesSx}>
                      {PROFILE_PAGE_TEXT.rolePrefix} {formatSchoolRoles(school.roles)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        <Paper component="section" elevation={0} sx={S.sectionSx}>
          {schedule.isError ? (
            <Alert severity="error">{PROFILE_PAGE_TEXT.scheduleError}</Alert>
          ) : schedule.isLoading ? (
            <Box sx={S.eventEmptySx}>
              <ClipLoader size={28} color="var(--admin-primary)" />
            </Box>
          ) : closestEvent && activeSchool ? (
            <LessonCard
              title={PROFILE_PAGE_TEXT.upcomingLessonTitle}
              lessonName={closestEvent.title}
              details={formatEventFullDateTime(closestEvent.start, closestEvent.end)}
              actionText={PROFILE_PAGE_TEXT.openCalendar}
              onActionClick={() =>
                navigate(
                  `/app/schools/${encodeURIComponent(activeSchool.schoolPublicId)}/schedule?eventId=${encodeURIComponent(closestEvent.id)}`,
                )
              }
            />
          ) : (
            <Box>
              <Typography component="h2" sx={S.sectionTitleSx}>
                {PROFILE_PAGE_TEXT.upcomingLessonTitle}
              </Typography>
              <Typography sx={S.eventEmptySx}>
                {PROFILE_PAGE_TEXT.upcomingLessonEmpty}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
