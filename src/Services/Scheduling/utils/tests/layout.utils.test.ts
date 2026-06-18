import { describe, it, expect } from 'vitest';
import { getWeekDays, getEventTopPx, getEventHeightPx } from '../layout.utils';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

const ev = (start: string, end: string): ScheduleEvent => ({
  id: 'x', title: 't', description: null, start, end, room: 'r',
  hostUserPublicId: 'h', attendees: [],
});

describe('layout.utils', () => {
  it('getWeekDays returns 7 Monday-first days covering the date', () => {
    // 2026-06-18 is a Thursday
    const days = getWeekDays(new Date('2026-06-18T12:00:00Z'));
    expect(days).toHaveLength(7);
    expect(days[0].getUTCDay()).toBe(1); // Monday
    expect(days[0].getUTCDate()).toBe(15); // Mon 2026-06-15
    expect(days[6].getUTCDate()).toBe(21); // Sun 2026-06-21
  });

  it('getEventTopPx offsets from the start hour', () => {
    // starts 14:30, grid starts at 8, 64px slots → (14.5-8)*64 = 416
    expect(getEventTopPx(ev('2026-06-18T14:30:00Z', '2026-06-18T15:00:00Z'), 8, 64)).toBe(416);
  });

  it('getEventHeightPx scales with duration', () => {
    // 90 min at 64px/hr = 96
    expect(getEventHeightPx(ev('2026-06-18T14:00:00Z', '2026-06-18T15:30:00Z'), 64)).toBe(96);
  });
});
