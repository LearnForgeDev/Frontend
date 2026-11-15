import type { ScheduleEvent } from '../../Scheduling.type';

export interface ScheduleEventListProps {
  events: ScheduleEvent[];
  dateLabel: string;
  emptyText?: string;
  onSelectEvent: (id: string) => void;
}
