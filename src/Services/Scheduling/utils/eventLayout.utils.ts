import type { ScheduleEvent } from '../Scheduling.type';
import { SLOT_HEIGHT_PX } from '../Scheduling.const';
import { getAgendaEvents } from './agenda.utils';
import type { PositionedScheduleEvent } from './eventLayout.utils.type';

export function getPositionedDayEvents(events: ScheduleEvent[], date: Date): PositionedScheduleEvent[] {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const minutes = (value: Date) => value.getHours() * 60 + value.getMinutes();
  const positioned = getAgendaEvents(events, date).map(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const from = eventStart < start ? 0 : minutes(eventStart);
    const until = eventEnd >= end ? 1440 : minutes(eventEnd);
    return { event, top: from / 60 * SLOT_HEIGHT_PX, height: Math.max(24, (until - from) / 60 * SLOT_HEIGHT_PX - 8), column: 0, columnCount: 1 };
  }).sort((first, second) => first.top - second.top || second.height - first.height || first.event.id.localeCompare(second.event.id));
  let group: PositionedScheduleEvent[] = [];
  let groupEnd = 0;
  const assignColumns = () => {
    const ends: number[] = [];
    for (const item of group) {
      const available = ends.findIndex(value => value <= item.top);
      item.column = available < 0 ? ends.length : available;
      ends[item.column] = item.top + item.height;
    }
    for (const item of group) {
      item.columnCount = ends.length;
    }
  };
  for (const item of positioned) {
    if (item.top >= groupEnd && group.length) {
      assignColumns();
      group = [];
    }
    group.push(item);
    groupEnd = Math.max(groupEnd, item.top + item.height);
  }
  assignColumns();
  return positioned;
}
