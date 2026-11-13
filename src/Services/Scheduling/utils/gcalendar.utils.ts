import { google } from 'calendar-link';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';

export function buildGoogleCalendarUrl(event: ScheduleEvent): string {
  return google({
    title: event.title,
    start: event.start,
    end: event.end,
    description: event.description ?? undefined,
  });
}
