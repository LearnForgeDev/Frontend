import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

/**
 * Pure, framework-free time helpers for the calendar.
 *
 * Day/slot comparisons use UTC components so they are deterministic
 * regardless of the host timezone — events are stored as ISO-8601 UTC.
 * Pass a `date` whose UTC calendar day is the day you want to inspect.
 */

const MS_PER_MINUTE = 60_000;

/** True once the current time has reached `windowMinutes` before `startIso`. */
export function isWithinJoinWindow(startIso: string, windowMinutes: number): boolean {
  const opensAt = new Date(startIso).getTime() - windowMinutes * MS_PER_MINUTE;
  return Date.now() >= opensAt;
}

/**
 * Milliseconds until the join window opens, for a single-fire `setTimeout`
 * recheck (no polling). Returns `null` when the window is already open —
 * meaning there is nothing further to schedule.
 */
export function getMillisUntilWindowChange(
  startIso: string,
  windowMinutes: number,
): number | null {
  const opensAt = new Date(startIso).getTime() - windowMinutes * MS_PER_MINUTE;
  const delta = opensAt - Date.now();
  return delta > 0 ? delta : null;
}

/** Localized "HH:MM – HH:MM" range for display. */
export function formatEventTimeRange(startIso: string, endIso: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const start = new Date(startIso).toLocaleTimeString([], opts);
  const end = new Date(endIso).toLocaleTimeString([], opts);
  return `${start} – ${end}`;
}

/** Whole-minute duration between two ISO instants. */
export function getEventDurationMinutes(startIso: string, endIso: string): number {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / MS_PER_MINUTE);
}

/** Inclusive list of hour numbers, e.g. `getHourSlots(8, 11)` → `[8,9,10,11]`. */
export function getHourSlots(startHour: number, endHour: number): number[] {
  const slots: number[] = [];
  for (let h = startHour; h <= endHour; h++) slots.push(h);
  return slots;
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/** Events whose start instant falls on the same UTC calendar day as `date`. */
export function findEventsForDate(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  return events.filter((e) => isSameUtcDay(new Date(e.start), date));
}

/**
 * True when no event on `date`'s UTC day overlaps the one-hour slot
 * `[hour, hour+1)` (UTC hours).
 */
export function isSlotEmpty(events: ScheduleEvent[], date: Date, hour: number): boolean {
  return !findEventsForDate(events, date).some((e) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const startHour = start.getUTCHours() + start.getUTCMinutes() / 60;
    const endHour = end.getUTCHours() + end.getUTCMinutes() / 60;
    // overlap of [startHour, endHour) with [hour, hour+1)
    return startHour < hour + 1 && endHour > hour;
  });
}
