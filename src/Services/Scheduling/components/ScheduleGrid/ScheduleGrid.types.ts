import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

export interface GridProps {
  events: ScheduleEvent[];
  onSelectEvent: (id: string) => void;
  selectedEventId: string | null;
  onSelectTimeSlot?: (date: Date) => void;
}

export interface DayColumnProps extends GridProps {
  date: Date;
}
