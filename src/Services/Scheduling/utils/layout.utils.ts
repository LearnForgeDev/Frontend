import { getEventDurationMinutes } from '@/Services/Scheduling/utils/time.utils';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

/**
 * Returns the seven UTC days of the week containing `date` (Monday-first).
 */
export function getWeekDays(date: Date): Date[] {
  const base = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = (base.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(base);
  monday.setUTCDate(base.getUTCDate() - dow);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return d;
  });
}

/**
 * Vertical pixel offset of an event from the top of a grid that starts at
 * `startHour`, with each hour `slotPx` tall. Clamped to 0.
 */
export function getEventTopPx(event: ScheduleEvent, startHour: number, slotPx: number): number {
  const start = new Date(event.start);
  const hours = start.getUTCHours() + start.getUTCMinutes() / 60;
  return Math.max(0, (hours - startHour) * slotPx);
}

/** Pixel height of an event block, with a small minimum for legibility. */
export function getEventHeightPx(event: ScheduleEvent, slotPx: number): number {
  return Math.max(24, (getEventDurationMinutes(event.start, event.end) / 60) * slotPx);
}
