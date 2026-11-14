import type { ScheduleEvent } from '../Scheduling.type';

export interface PositionedScheduleEvent {
  event: ScheduleEvent;
  top: number;
  height: number;
  column: number;
  columnCount: number;
}
