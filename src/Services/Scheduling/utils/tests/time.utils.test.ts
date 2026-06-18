import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isWithinJoinWindow,
  getMillisUntilWindowChange,
  formatEventTimeRange,
  getEventDurationMinutes,
  getHourSlots,
  findEventsForDate,
  isSlotEmpty,
} from '../time.utils';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

afterEach(() => vi.useRealTimers());

const ev = (start: string, end: string): ScheduleEvent => ({
  id: 'x',
  title: 't',
  description: null,
  start,
  end,
  room: 'r',
  hostUserPublicId: 'h',
  attendees: [],
});

describe('time.utils', () => {
  it('isWithinJoinWindow opens exactly windowMinutes before start', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-06-18T13:56:00Z'));
    expect(isWithinJoinWindow('2026-06-18T14:00:00Z', 5)).toBe(true);
    vi.setSystemTime(new Date('2026-06-18T13:54:00Z'));
    expect(isWithinJoinWindow('2026-06-18T14:00:00Z', 5)).toBe(false);
  });

  it('getMillisUntilWindowChange returns ms until open, then null once open', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-06-18T13:54:00Z'));
    expect(getMillisUntilWindowChange('2026-06-18T14:00:00Z', 5)).toBe(60_000);
    vi.setSystemTime(new Date('2026-06-18T13:56:00Z'));
    expect(getMillisUntilWindowChange('2026-06-18T14:00:00Z', 5)).toBeNull();
  });

  it('getEventDurationMinutes computes whole minutes', () => {
    expect(getEventDurationMinutes('2026-06-18T14:00:00Z', '2026-06-18T15:30:00Z')).toBe(90);
  });

  it('formatEventTimeRange joins start and end with an en dash', () => {
    const out = formatEventTimeRange('2026-06-18T14:00:00Z', '2026-06-18T15:30:00Z');
    expect(out).toContain('–');
    expect(out.split('–')).toHaveLength(2);
  });

  it('getHourSlots is inclusive of both bounds', () => {
    expect(getHourSlots(8, 11)).toEqual([8, 9, 10, 11]);
  });

  it('findEventsForDate matches by calendar day', () => {
    const list = [
      ev('2026-06-18T14:00:00Z', '2026-06-18T15:00:00Z'),
      ev('2026-06-19T09:00:00Z', '2026-06-19T10:00:00Z'),
    ];
    const found = findEventsForDate(list, new Date('2026-06-18T03:00:00Z'));
    expect(found).toHaveLength(1);
    expect(found[0].start).toBe('2026-06-18T14:00:00Z');
  });

  it('isSlotEmpty is false when an event overlaps the hour, true otherwise', () => {
    const list = [ev('2026-06-18T14:00:00Z', '2026-06-18T15:00:00Z')];
    const day = new Date('2026-06-18T00:00:00Z');
    expect(isSlotEmpty(list, day, 14)).toBe(false);
    expect(isSlotEmpty(list, day, 16)).toBe(true);
  });
});
