import { useJoinMeeting } from '@/Services/Scheduling/hooks/useJoinMeeting/useJoinMeeting';
import { useScheduleMutations } from '@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import type { MeetingInterval } from '@/Services/Scheduling/utils/meeting.utils';
import type { UseStartMeetingNowReturn } from './useStartMeetingNow.types';

export function useStartMeetingNow(): UseStartMeetingNowReturn {
  const { updateEvent } = useScheduleMutations();
  const joinMeeting = useJoinMeeting();

  const startMeetingNow = async (event: ScheduleEvent, interval: MeetingInterval) => {
    const updatedEvent = await updateEvent.mutateAsync({
      eventId: event.id,
      input: {
        title: event.title,
        description: event.description,
        startUtc: interval.startUtc,
        endUtc: interval.endUtc,
        room: event.room,
        attendeeUserPublicIds: event.attendees.map((attendee) => attendee.userPublicId),
      },
    });

    await joinMeeting.mutateAsync(updatedEvent);
  };

  return {
    startMeetingNow,
    isPending: updateEvent.isPending || joinMeeting.isPending,
  };
}
