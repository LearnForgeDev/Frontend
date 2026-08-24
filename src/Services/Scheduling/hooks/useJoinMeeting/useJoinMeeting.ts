import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSchoolId } from '@/Services/Scheduling/hooks/useSchoolId/useSchoolId';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

/**
 * Navigates to the embedded CallsPage (/app/schools/:schoolPublicId/calls?room=...)
 * for a schedule event room instead of opening an external window.
 */
export function useJoinMeeting(): UseMutationResult<void, Error, ScheduleEvent> {
  const schoolPublicId = useSchoolId();
  const navigate = useNavigate();

  return useMutation<void, Error, ScheduleEvent>({
    mutationFn: async (event) => {
      if (!schoolPublicId || !event.room) {
        throw new Error('Meeting room is unavailable.');
      }
      const searchParams = new URLSearchParams({
        room: event.room,
        title: event.title,
      });

      navigate(`/app/schools/${schoolPublicId}/calls?${searchParams.toString()}`);
    },
  });
}
