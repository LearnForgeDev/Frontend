import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useSchools } from '@/Services/AdminPanel/SchoolsPage/hooks/useSchools';
import { useLessons } from '@/Services/Lessons/hooks/useLessons/useLessons';
import { useCreateLessonFlow } from '@/Services/Lessons/hooks/useCreateLessonFlow/useCreateLessonFlow';
import { useScheduleEvents } from '@/Services/Scheduling/hooks/useScheduleEvents/useScheduleEvents';
import { useStudents } from '@/Services/Schools/StudentsPage/hooks/useStudents';
import { getSchoolCapabilities } from '@/Services/AppShell/utils/getSchoolCapabilities';
import {
  formatTodayDate,
  getRecentLessons,
  getTodayEvents,
  getUpcomingEvent,
} from '../../TodayPage.utils';

export const useTodayPage = () => {
  const navigate = useNavigate();
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();
  const userName = useGlobalContext((state) => state.auth.user?.userName);
  const { data: schools } = useSchools();
  const schedule = useScheduleEvents();
  const lessonsQuery = useLessons();
  const currentSchool = schools?.find(
    (school) => school.schoolPublicId === schoolPublicId,
  );
  const { canTeach, canManageSchool } = getSchoolCapabilities(currentSchool?.roles ?? []);
  const studentsQuery = useStudents(schoolPublicId, canManageSchool);

  const { handleCreateLesson, isCreating } = useCreateLessonFlow({
    onSuccess: (lessonId, title) => {
      navigate(`../lessons/${encodeURIComponent(lessonId)}?edit=true`, {
        relative: 'path',
        state: { id: lessonId, title },
      });
    },
  });

  return {
    userName,
    dateLabel: formatTodayDate(),
    canTeach,
    canManageSchool,
    studentCount: studentsQuery.data?.length ?? 0,
    isSchoolSummaryLoading: studentsQuery.isLoading,
    isSchoolSummaryError: studentsQuery.isError,
    isCreatingLesson: isCreating,
    upcomingEvent: getUpcomingEvent(schedule.events),
    todayEvents: getTodayEvents(schedule.events),
    recentLessons: getRecentLessons(lessonsQuery.lessons),
    isScheduleLoading: schedule.isLoading,
    isScheduleError: schedule.isError,
    isLessonsLoading: lessonsQuery.isLoading,
    isLessonsError: lessonsQuery.isError,
    createLesson: () => handleCreateLesson(),
    openSchedule: () => navigate('../schedule', { relative: 'path' }),
    openEvent: (eventId: string) =>
      navigate(`../schedule?eventId=${encodeURIComponent(eventId)}`, {
        relative: 'path',
      }),
    scheduleLesson: () => navigate('../schedule', { relative: 'path' }),
    openLessons: () => navigate('../lessons', { relative: 'path' }),
    openLesson: (lessonId: string, title: string) =>
      navigate(`../lessons/${encodeURIComponent(lessonId)}?edit=true`, {
        relative: 'path',
        state: { id: lessonId, title },
      }),
  };
};
