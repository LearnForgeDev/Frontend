import { useNavigate } from 'react-router-dom';
import { useSchoolId } from '@/Services/Scheduling/hooks/useSchoolId/useSchoolId';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

/**
 * Navigates to the embedded CallsPage (/schools/:schoolPublicId/calls?room=...)
 * for a schedule event room instead of opening an external window.
 */
export function useJoinMeeting() {
  const schoolPublicId = useSchoolId();
  const navigate = useNavigate();

  return {
    isPending: false,
    mutate: (event: ScheduleEvent) => {
      if (schoolPublicId && event.room) {
        navigate(`/schools/${schoolPublicId}/calls?room=${encodeURIComponent(event.room)}`);
      }
    },
  };
}
