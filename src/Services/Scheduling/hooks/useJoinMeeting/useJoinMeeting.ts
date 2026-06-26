import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { meetEndpoints } from '@/Endpoints';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import { useSchoolId } from '@/Services/Scheduling/hooks/useSchoolId/useSchoolId';
import { appErrorMessage } from '@/Services/Scheduling/utils/appErrorMessage';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import type { AppError } from '@/Endpoints';

/**
 * Requests a real Jitsi join link for an event's room via the existing
 * `POST /api/ApiMeet/token` endpoint, then opens it in a new tab. On failure
 * it surfaces a notification through the global notification store (the same
 * pattern as `useCreateCall`).
 */
export function useJoinMeeting(): UseMutationResult<string, AppError, ScheduleEvent> {
  const schoolPublicId = useSchoolId();
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);

  return useMutation<string, AppError, ScheduleEvent>({
    mutationFn: async (event) => {
      const response = await meetEndpoints.getMeetToken({ schoolPublicId, Room: event.room });
      return response.roomUrl;
    },
    onSuccess: (roomUrl) => {
      window.open(roomUrl, '_blank', 'noopener,noreferrer');
    },
    onError: (error) => {
      showNotification({
        id: `join-meeting-error-${Date.now()}`,
        title: 'Error Joining Session',
        subtitle: appErrorMessage(error, 'Could not join the meeting. Please try again.'),
        priority: 'high',
        time: 5000,
      });
    },
  });
}
