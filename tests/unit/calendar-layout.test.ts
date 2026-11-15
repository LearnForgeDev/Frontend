import { describe, expect, it } from 'vitest';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';
import { getPositionedDayEvents } from '@/Services/Scheduling/utils/eventLayout.utils';
import { formatSchedulePeriod } from '@/Services/Scheduling/utils/period.utils';
import { getWeekAgendaEvents } from '@/Services/Scheduling/utils/agenda.utils';

const date = new Date(2026, 10, 18);
function event(id: string, start: string, end: string): ScheduleEvent {
  return { id, title: id, start, end, description: null, room: id, hostUserPublicId: 'teacher', attendees: [] };
}

describe('Calendar timeline layout', () => {
  it('positions the full day without restricting events to working hours', () => {
    const events = [0, 6, 22, 23].map(hour => event(String(hour), `2026-11-18T${String(hour).padStart(2, '0')}:00:00`, `2026-11-${hour === 23 ? '19T00' : `18T${String(hour + 1).padStart(2, '0')}`}:00:00`));
    const result = getPositionedDayEvents(events, date);
    expect(result.map(item => item.top)).toEqual([0, 384, 1408, 1472]);
    expect(result.every(item => item.height === 56 && item.column === 0 && item.columnCount === 1)).toBe(true);
  });

  it('separates overlapping chains and reuses a free column without covering another event', () => {
    const events = [event('a', '2026-11-18T10:00:00', '2026-11-18T11:00:00'), event('b', '2026-11-18T10:30:00', '2026-11-18T11:30:00'), event('c', '2026-11-18T11:00:00', '2026-11-18T12:00:00'), event('d', '2026-11-18T16:00:00', '2026-11-18T17:00:00')];
    const result = getPositionedDayEvents(events, date);
    expect(result.map(item => [item.event.id, item.column, item.columnCount])).toEqual([['a', 0, 2], ['b', 1, 2], ['c', 0, 2], ['d', 0, 1]]);
    expect(events.map(item => Object.keys(item))).toEqual(result.map(item => Object.keys(item.event)));
  });

  it('keeps short-event minimum sizes from visually overlapping', () => {
    const result = getPositionedDayEvents([event('first', '2026-11-18T10:00:00', '2026-11-18T10:05:00'), event('second', '2026-11-18T10:05:00', '2026-11-18T10:10:00')], date);
    expect(result.map(item => item.height)).toEqual([24, 24]);
    expect(result.map(item => item.column)).toEqual([0, 1]);
  });

  it('clips overnight events to this day and excludes exact adjacent-day boundaries', () => {
    const events = [event('before', '2026-11-17T23:00:00', '2026-11-18T01:00:00'), event('after', '2026-11-18T23:00:00', '2026-11-19T02:00:00'), event('ended', '2026-11-17T23:00:00', '2026-11-18T00:00:00'), event('next', '2026-11-19T00:00:00', '2026-11-19T01:00:00')];
    const result = getPositionedDayEvents(events, date);
    expect(result.map(item => [item.event.id, item.top, item.height])).toEqual([['before', 0, 56], ['after', 1472, 56]]);
  });

  it('orders equal-time events deterministically and leaves the input untouched', () => {
    const events = [event('b', '2026-11-18T12:00:00', '2026-11-18T13:00:00'), event('a', '2026-11-18T12:00:00', '2026-11-18T13:00:00')];
    expect(getPositionedDayEvents(events, date).map(item => item.event.id)).toEqual(['a', 'b']);
    expect(events.map(item => item.id)).toEqual(['b', 'a']);
    expect(getPositionedDayEvents([], date)).toEqual([]);
  });
});

describe('Calendar period navigation', () => {
  it('labels days and weeks through month and year boundaries', () => {
    expect(formatSchedulePeriod(date, 'day')).toBe('18 ноября 2026');
    expect(formatSchedulePeriod(date, 'week')).toBe('16–22 ноября 2026');
    expect(formatSchedulePeriod(new Date(2026, 10, 30), 'agenda')).toBe('30 ноября – 6 декабря 2026');
    expect(formatSchedulePeriod(new Date(2027, 0, 1), 'week')).toBe('28 декабря 2026 – 3 января 2027');
  });

  it('lists the selected week once per event, including overnight intersections', () => {
    const events = [event('sunday', '2026-11-22T23:00:00', '2026-11-23T01:00:00'), event('monday', '2026-11-15T23:00:00', '2026-11-16T01:00:00'), event('outside', '2026-11-23T00:00:00', '2026-11-23T01:00:00')];
    expect(getWeekAgendaEvents(events, date).map(item => item.id)).toEqual(['monday', 'sunday']);
    expect(getWeekAgendaEvents([], date)).toEqual([]);
  });
});
