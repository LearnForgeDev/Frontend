import type { ScheduleEvent } from '../Scheduling.type';
import { AGENDA_DATE_FORMAT } from '../Scheduling.const';
import { getWeekStart } from './time.utils';

export function getAgendaEvents(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
  return events.filter(event => Date.parse(event.start) < end && Date.parse(event.end) > start)
    .sort((first, second) => Date.parse(first.start) - Date.parse(second.start));
}

export function formatAgendaDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', AGENDA_DATE_FORMAT);
}

export function getWeekAgendaEvents(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  const first = getWeekStart(date);
  const last = new Date(first);
  last.setDate(first.getDate() + 7);
  return events.filter(event => Date.parse(event.start) < last.getTime() && Date.parse(event.end) > first.getTime())
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
