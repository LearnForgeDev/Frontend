import { MONTH_NAMES_NOMINATIVE } from '@/Services/Scheduling/Scheduling.const';
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

export function formatEventTimeRange(startIso: string, endIso: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  const start = new Date(startIso).toLocaleTimeString([], opts);
  const end = new Date(endIso).toLocaleTimeString([], opts);
  return `${start} – ${end}`;
}

export function formatEventFullDateTime(startIso: string, endIso: string): string {
  const rawDate = new Date(startIso).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const dateStr = rawDate ? rawDate.charAt(0).toUpperCase() + rawDate.slice(1) : '';
  const timeStr = formatEventTimeRange(startIso, endIso);
  return `${dateStr} · ${timeStr}`;
}

export function getEventDurationMinutes(startIso: string, endIso: string): number {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / MS_PER_MINUTE);
}

export function getHourSlots(startHour: number, endHour: number): number[] {
  const slots: number[] = [];
  for (let h = startHour; h <= endHour; h++) slots.push(h);
  return slots;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export const isSameUtcDay = isSameDay;

export function getWeekStart(date: Date): Date {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = (base.getDay() + 6) % 7;
  const monday = new Date(base);
  monday.setDate(base.getDate() - dow);
  return monday;
}
export const getWeekStartUtc = getWeekStart;

export function isToday(date: Date, now: Date = new Date()): boolean {
  return isSameDay(now, date);
}
export const isTodayUtc = isToday;

export function formatMonthYearTitle(date: Date, view: 'day' | 'week' | 'agenda'): string {
  if (view === 'week') {
    const monday = getWeekStart(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const m1 = monday.getMonth();
    const y1 = monday.getFullYear();
    const m2 = sunday.getMonth();
    const y2 = sunday.getFullYear();

    if (y1 !== y2) {
      return `${MONTH_NAMES_NOMINATIVE[m1]} ${y1} – ${MONTH_NAMES_NOMINATIVE[m2]} ${y2}`;
    }
    if (m1 !== m2) {
      return `${MONTH_NAMES_NOMINATIVE[m1]} – ${MONTH_NAMES_NOMINATIVE[m2]} ${y1}`;
    }
    return `${MONTH_NAMES_NOMINATIVE[m1]} ${y1}`;
  }

  const month = date.getMonth();
  const year = date.getFullYear();
  return `${MONTH_NAMES_NOMINATIVE[month]} ${year}`;
}

export interface MonthGridDay {
  date: Date;
  isCurrentMonth: boolean;
}

export function getMonthCalendarGrid(year: number, month: number): MonthGridDay[][] {
  const firstOfMonth = new Date(year, month, 1);
  const firstDow = (firstOfMonth.getDay() + 6) % 7;
  const startDay = new Date(firstOfMonth);
  startDay.setDate(firstOfMonth.getDate() - firstDow);

  const grid: MonthGridDay[][] = [];
  const cur = new Date(startDay);

  for (let week = 0; week < 6; week++) {
    const weekRow: MonthGridDay[] = [];
    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(cur);
      weekRow.push({
        date: cellDate,
        isCurrentMonth: cellDate.getMonth() === month,
      });
      cur.setDate(cur.getDate() + 1);
    }
    grid.push(weekRow);
    if (week >= 4 && cur.getMonth() !== month && (cur.getFullYear() >= year || month === 11)) {
      break;
    }
  }

  return grid;
}

export function getCurrentTimeOffsetPx(startHour: number, slotPx: number, now: Date = new Date()): number {
  const hours = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  return Math.max(0, (hours - startHour) * slotPx);
}

export function findEventsForDate(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  return events.filter((e) => isSameDay(new Date(e.start), date));
}

export function isSlotEmpty(events: ScheduleEvent[], date: Date, hour: number): boolean {
  return !findEventsForDate(events, date).some((e) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    return startHour < hour + 1 && endHour > hour;
  });
}

export function isoToLocalDateInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isoToLocalTimeInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatLocalDateInput(d?: Date): string {
  const date = d ?? new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatLocalTimeInput(d?: Date): string {
  const date = d ?? new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localDateTimeToIso(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return '';
  const d = new Date(`${dateStr}T${timeStr}:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}
