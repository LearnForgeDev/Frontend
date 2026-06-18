import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

export interface EventBlockProps {
  event: ScheduleEvent;
  onSelect?: (id: string) => void;
  selected?: boolean;
  /** When true, the block sizes its height from the event duration (grid use). */
  sized?: boolean;
}
