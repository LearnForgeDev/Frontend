import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

export interface MeetingInterval {
  startUtc: string;
  endUtc: string;
}

export function moveMeetingToTimestamp(event: ScheduleEvent, startTimestamp: number): MeetingInterval {
  const duration = new Date(event.end).getTime() - new Date(event.start).getTime();

  return {
    startUtc: new Date(startTimestamp).toISOString(),
    endUtc: new Date(startTimestamp + duration).toISOString(),
  };
}
