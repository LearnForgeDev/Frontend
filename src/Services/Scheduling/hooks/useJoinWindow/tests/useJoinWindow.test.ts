// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { expect, test, describe, vi, afterEach } from 'vitest';
import { useJoinWindow } from '@/Services/Scheduling/hooks/useJoinWindow/useJoinWindow';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

afterEach(() => vi.useRealTimers());

const ev = (start: string, end: string): ScheduleEvent => ({
  id: 'x', title: 't', description: null, start, end, room: 'r',
  hostUserPublicId: 'h', attendees: [],
});

describe('useJoinWindow', () => {
  test('closed before the window, opens via a single-fire timer', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-06-18T13:50:00Z'));
    // window opens at 13:55 (5 min before 14:00)
    const { result } = renderHook(() => useJoinWindow(ev('2026-06-18T14:00:00Z', '2026-06-18T15:00:00Z')));

    expect(result.current).toBe(false);
    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000); // past 13:55
    });
    expect(result.current).toBe(true);
  });

  test('closed once the event has ended', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-06-18T16:00:00Z'));
    const { result } = renderHook(() => useJoinWindow(ev('2026-06-18T14:00:00Z', '2026-06-18T15:00:00Z')));
    expect(result.current).toBe(false);
  });
});
