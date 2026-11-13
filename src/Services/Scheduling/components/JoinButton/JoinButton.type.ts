import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';

export interface JoinButtonProps {
  event: ScheduleEvent;
  size?: 'small' | 'medium' | 'large';
}
