import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';

export interface EventDetailModalProps {
  event: ScheduleEvent | null;
  canManage: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onEdit?: (event: ScheduleEvent) => void;
  onDelete: (id: string) => void;
}
