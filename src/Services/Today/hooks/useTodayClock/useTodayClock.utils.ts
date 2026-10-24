import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

export function getNextTodayRefreshAt(events: ScheduleEvent[], now: Date): number {
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  return events.reduce((next, event) => {
    const end = Date.parse(event.end);
    return end > now.getTime() ? Math.min(next, end) : next;
  }, nextDay);
}
