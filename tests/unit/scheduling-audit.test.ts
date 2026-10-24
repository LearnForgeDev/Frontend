import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAgendaEvents } from '../../src/Services/Scheduling/utils/agenda.utils';
import { getTodayEvents, getUpcomingEvent } from '../../src/Services/Today/TodayPage.utils';
import { useTodayClock } from '../../src/Services/Today/hooks/useTodayClock/useTodayClock';
import type { ScheduleEvent } from '../../src/Services/Scheduling/Scheduling.types';

const event: ScheduleEvent = {
  id: 'lesson', title: 'Математика', description: null, room: 'room', hostUserPublicId: 'teacher', attendees: [],
  start: '2026-10-21T10:00:00', end: '2026-10-21T11:00:00',
};

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('Актуальное расписание', () => {
  it('показывает выбранный день, оставляя прошлые дни доступными', () => {
    const yesterday = { ...event, id: 'yesterday', start: '2026-10-20T10:00:00', end: '2026-10-20T11:00:00' };
    const nextYear = { ...event, id: 'next-year', start: '2027-10-21T10:00:00', end: '2027-10-21T11:00:00' };
    expect(getAgendaEvents([nextYear, yesterday, event], new Date('2026-10-21T12:00:00'))).toEqual([event]);
    expect(getAgendaEvents([yesterday, event], new Date('2026-10-20T12:00:00'))).toEqual([yesterday]);
    expect(getAgendaEvents([event], new Date('2026-10-22T12:00:00'))).toEqual([]);
  });

  it('показывает переходящее через полночь занятие, но не завершённое на границе дня', () => {
    const overnight = { ...event, start: '2026-10-20T23:30:00', end: '2026-10-21T00:30:00' };
    const ended = { ...overnight, id: 'ended', end: '2026-10-21T00:00:00' };
    expect(getAgendaEvents([ended, overnight], new Date('2026-10-21T12:00:00'))).toEqual([overnight]);
  });

  it('меняет ближайшее занятие ровно при завершении текущего', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-21T10:59:59'));
    const next = { ...event, id: 'next', start: '2026-10-21T12:00:00', end: '2026-10-21T13:00:00' };
    const events = [event, next];
    const { result } = renderHook(() => getUpcomingEvent(events, useTodayClock(events)));
    expect(result.current?.id).toBe(event.id);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current?.id).toBe(next.id);
  });

  it('обновляет дату и список сегодня в полночь без сетевого ответа', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T23:59:59'));
    const events = [event];
    const { result } = renderHook(() => {
      const now = useTodayClock(events);
      return { day: now.getDate(), events: getTodayEvents(events, now) };
    });
    expect(result.current.events).toEqual([]);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.day).toBe(21);
    expect(result.current.events).toEqual([event]);
  });
});
