import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';

export interface EventDetailPanelProps {
  event: ScheduleEvent | null;
  canManage: boolean;
}
