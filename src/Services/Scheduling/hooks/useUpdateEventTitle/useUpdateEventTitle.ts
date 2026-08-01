import { useScheduleMutations } from '@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

export function useUpdateEventTitle(event: ScheduleEvent | null) {
  const { updateEvent } = useScheduleMutations();

  const saveTitle = (newTitle: string) => {
    if (!event) return;
    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === event.title) return;

    updateEvent.mutate({
      eventId: event.id,
      input: {
        title: trimmed,
        description: event.description,
        startUtc: event.start,
        endUtc: event.end,
        room: event.room,
        attendeeUserPublicIds: event.attendees.map((a) => a.userPublicId),
      },
    });
  };

  return { saveTitle, isUpdating: updateEvent.isPending };
}
