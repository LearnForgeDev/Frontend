import type { ScheduleEvent } from '../Scheduling.types';
import { AGENDA_DATE_FORMAT } from '../components/ScheduleGrid/AgendaList.const';

export function getAgendaEvents(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
  return events.filter(event => Date.parse(event.start) < end && Date.parse(event.end) > start)
    .sort((first, second) => Date.parse(first.start) - Date.parse(second.start));
}

export function formatAgendaDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', AGENDA_DATE_FORMAT);
}
