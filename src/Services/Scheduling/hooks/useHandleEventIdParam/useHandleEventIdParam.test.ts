import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHandleEventIdParam } from './useHandleEventIdParam';
import type { ScheduleEvent } from '../../Scheduling.types';

const setSelectedEventId = vi.fn();
const setSelectedDate = vi.fn();
const setSearchParams = vi.fn();
let searchParams = new URLSearchParams('eventId=lesson');
vi.mock('react-router-dom', () => ({ useSearchParams: () => [searchParams, setSearchParams] }));
vi.mock('@/Storage/SchedulingContext/SchedulingContext', () => ({ useSchedulingContext: () => ({ setSelectedEventId, setSelectedDate }) }));
vi.mock('../useSchoolId/useSchoolId', () => ({ useSchoolId: () => 'school' }));
const event: ScheduleEvent = {
  id: 'lesson', title: 'Математика', description: null, room: 'room', hostUserPublicId: 'teacher', attendees: [],
  start: '2026-10-21T10:00:00', end: '2026-10-21T11:00:00',
};

beforeEach(() => { vi.clearAllMocks(); searchParams = new URLSearchParams('eventId=lesson'); });
afterEach(cleanup);

describe('Ссылка на занятие', () => {
  it('открывает занятие после ошибки и успешного повтора запроса', () => {
    const { result, rerender } = renderHook(({ events, isSuccess }) => useHandleEventIdParam(events, isSuccess), {
      initialProps: { events: [] as ScheduleEvent[], isSuccess: false },
    });
    expect(result.current.isUnavailable).toBe(false);
    expect(setSelectedEventId).not.toHaveBeenCalled();
    rerender({ events: [event], isSuccess: true });
    expect(setSelectedEventId).toHaveBeenCalledWith('lesson');
    expect(setSelectedDate).toHaveBeenCalledWith(new Date(event.start));
    rerender({ events: [{ ...event }], isSuccess: true });
    expect(setSelectedEventId).toHaveBeenCalledTimes(1);
  });

  it('показывает недоступное событие только после успешной загрузки', () => {
    const { result, rerender } = renderHook(({ success }) => useHandleEventIdParam([], success), { initialProps: { success: false } });
    expect(result.current.isUnavailable).toBe(false);
    rerender({ success: true });
    expect(result.current.isUnavailable).toBe(true);
  });

  it('обрабатывает новое событие в URL без размонтирования страницы', () => {
    const events = [event, { ...event, id: 'second' }];
    const { rerender } = renderHook(() => useHandleEventIdParam(events, true));
    searchParams = new URLSearchParams('eventId=second');
    rerender();
    expect(setSelectedEventId).toHaveBeenLastCalledWith('second');
  });
});
