import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';

export interface ScheduleSidebarProps {
  events: ScheduleEvent[];
  canManage: boolean;
  onOpenCreateModal: () => void;
}
