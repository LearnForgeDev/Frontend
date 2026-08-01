import { getEventDurationMinutes } from '@/Services/Scheduling/utils/time.utils';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

/**
 * Returns the seven days of the week containing `date` in local timezone (Monday-first).
 */
export function getWeekDays(date: Date): Date[] {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = (base.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(base);
  monday.setDate(base.getDate() - dow);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/**
 * Vertical pixel offset of an event from the top of a grid that starts at
 * `startHour`, with each hour `slotPx` tall. Clamped to 0.
 */
export function getEventTopPx(event: ScheduleEvent, startHour: number, slotPx: number): number {
  const start = new Date(event.start);
  const hours = start.getHours() + start.getMinutes() / 60;
  return Math.max(0, (hours - startHour) * slotPx);
}

/** Pixel height of an event block, with a small minimum for legibility. */
export function getEventHeightPx(event: ScheduleEvent, slotPx: number): number {
  return Math.max(24, (getEventDurationMinutes(event.start, event.end) / 60) * slotPx);
}
