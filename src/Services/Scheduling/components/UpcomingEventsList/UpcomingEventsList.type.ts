import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';

export interface UpcomingEventsListProps {
  events: ScheduleEvent[];
  onSelect: (id: string) => void;
  selectedEventId: string | null;
}
