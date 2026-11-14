import type { ScheduleEvent } from '../../Scheduling.type';

export interface SelectedScheduleEventProps {
  event: ScheduleEvent;
  canManage: boolean;
  onOpen: (id: string) => void;
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (id: string) => void;
}
