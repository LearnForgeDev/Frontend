import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Skeleton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import { useNavigate } from 'react-router-dom';
import { useSchools } from '@/Services/AdminPanel/SchoolsPage/hooks/useSchools';
import { formatEventFullDateTime } from '@/Services/Scheduling/utils/time.utils';

import { useScheduleEvents } from '../Scheduling/hooks/useScheduleEvents/useScheduleEvents';

import {
  pageRootSx,
  bannerSx,
  containerSx,
  backButtonSx,
  profileSidebarSx,
  notAuthContainerSx,
  widgetsContainerSx,
  statsGridSx,
} from './ProfilePage.styles';

import { ProfileCard } from './components/ProfileCard/ProfileCard';
import { StatCard } from './components/StatCard/StatCard';
import { LessonCard } from './components/LessonCard/LessonCard';
import type { ScheduleEvent } from '../Scheduling/Scheduling.types';
import { getClosestEvent } from './ProfilePage.utils';

const ProfilePage: React.FC = () => {
  const [closestEvent, setClosestEvent] = useState<ScheduleEvent | undefined | null>(undefined);
  const user = useGlobalContext((s) => s.auth.user);
  const logout = useGlobalContext((s) => s.auth.logout);
  const navigate = useNavigate();

  const { data: schools } = useSchools();
  const activeSchool = schools?.find(s => s.schoolPublicId === user?.activeSchoolPublicId) || schools?.find(s => s.schoolPublicId === String(user?.activeSchoolId));

  const { events } = useScheduleEvents();

  useEffect(() => {
    console.log(events)
    setClosestEvent(getClosestEvent(events));
  }, [events]);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login', { replace: true });
    }
  }, [user, navigate]);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) {
    return (
      <Box sx={notAuthContainerSx}>
        <Typography color="error">Пользователь не авторизован</Typography>
      </Box>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  return (
    <Box sx={pageRootSx}>
      <Box sx={bannerSx(undefined, scrollY)}>
        <IconButton onClick={() => navigate(-1)} sx={backButtonSx}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Box sx={containerSx}>
        <Box sx={profileSidebarSx}>
          <ProfileCard
            user={user}
            activeSchool={activeSchool}
            onLogout={handleLogout}
            onAdminPanel={handleAdminPanel}
          />
        </Box>

        <Box sx={widgetsContainerSx}>
          <Box sx={statsGridSx}>
            <StatCard
              title="Пройдено уроков"
              value="42"
              label="+3 за эту неделю"
            />
            <StatCard
              title="Часов на платформе"
              value="128"
              label="Входит в топ 10% учеников"
            />
            <StatCard
              title="Средний балл"
              value="4.8"
              label="Отличный результат"
            />
          </Box>


          {
            closestEvent ?
              (
                <LessonCard
                  title="Ближайший урок"
                  lessonName={closestEvent?.title}
                  details={formatEventFullDateTime(closestEvent?.start, closestEvent?.end)}
                  actionText='Посмотреть в календаре'
                  onActionClick={() => navigate(
                    `/admin/schools/${activeSchool?.schoolPublicId}/schedule?eventId=${closestEvent?.id}`
                  )}
                />
              ) : null
          }
          {
            closestEvent === undefined ?
              (
                <Skeleton variant="rectangular" width={200} height={100} />
              ) : null
          }
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
