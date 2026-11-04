import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useLogout } from '@/Services/Auth/hooks/useLogout/useLogout';
import { useSchools } from '@/Services/AdminPanel/SchoolsPage/hooks/useSchools';
import { getSchoolCapabilities } from '@/Services/AppShell/utils/getSchoolCapabilities';
import { useScheduleEvents } from '@/Services/Scheduling/hooks/useScheduleEvents/useScheduleEvents';
import { formatEventFullDateTime } from '@/Services/Scheduling/utils/time.utils';
import { formatSchoolRoles, getClosestEvent, getProfileSchool } from '../ProfilePage.utils';
import { PROFILE_PAGE_TEXT } from '../ProfilePage.const';

export function useProfilePage() {
  const navigate = useNavigate();
  const user = useGlobalContext((state) => state.auth.user);
  const logout = useLogout();
  const schoolsQuery = useSchools();
  const activeSchool = getProfileSchool(schoolsQuery.data ?? [], user?.activeSchoolPublicId);
  const schedule = useScheduleEvents(activeSchool?.schoolPublicId ?? '');
  const canCreateLesson = getSchoolCapabilities(activeSchool?.roles ?? []).canTeach;
  const setActiveSchoolPublicId = useGlobalContext((state) => state.auth.setActiveSchoolPublicId);
  const [isCreateLessonOpen, setCreateLessonOpen] = useState(false);
  const closestEvent = activeSchool ? getClosestEvent(schedule.events) : null;

  const openCalendar = () => {
    if (!activeSchool || !closestEvent) return;
    navigate(`/app/schools/${encodeURIComponent(activeSchool.schoolPublicId)}/schedule?eventId=${encodeURIComponent(closestEvent.id)}`);
  };
  const schoolItems = schoolsQuery.data?.map((school) => ({
    id: school.schoolPublicId,
    title: school.schoolName,
    details: `${PROFILE_PAGE_TEXT.rolePrefix} ${formatSchoolRoles(school.roles)}`,
  })) ?? [];
  const lessonItems = closestEvent ? [{
    id: closestEvent.id,
    title: closestEvent.title,
    details: formatEventFullDateTime(closestEvent.start, closestEvent.end),
    actionLabel: PROFILE_PAGE_TEXT.openCalendar,
    onAction: openCalendar,
  }] : [];

  return {
    user,
    logout,
    schoolsQuery,
    schedule,
    schoolItems,
    lessonItems,
    canCreateLesson,
    isCreateLessonOpen,
    openCreateLesson: () => {
      if (!activeSchool || !canCreateLesson) return;
      setActiveSchoolPublicId(activeSchool.schoolPublicId);
      setCreateLessonOpen(true);
    },
    closeCreateLesson: () => setCreateLessonOpen(false),
    addSchool: () => navigate('/onboarding'),
  };
}
