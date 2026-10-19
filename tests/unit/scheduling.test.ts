import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useJoinWindow } from '../../src/Services/Scheduling/hooks/useJoinWindow/useJoinWindow';
import { getClosestEvent } from '../../src/Services/Profile/ProfilePage.utils';
import { getCallButtonText } from '../../src/Services/Scheduling/components/JoinButton/utils';
import { getWeekDays, getEventHeightPx, getEventTopPx } from '../../src/Services/Scheduling/utils/layout.utils';
import {
  getEventDurationMinutes, getMonthCalendarGrid,
  getWeekStart, isSlotEmpty, localDateTimeToIso,
  isoToLocalDateInput, isoToLocalTimeInput,
} from '../../src/Services/Scheduling/utils/time.utils';
import type { ScheduleEvent } from '../../src/Services/Scheduling/Scheduling.types';

const event: ScheduleEvent = {
  id: 'event', title: 'Занятие', description: null,
  start: '2026-10-18T12:30:00', end: '2026-10-18T13:15:00',
  room: 'room', hostUserPublicId: 'teacher', attendees: [],
};
const MINUTE_MS = 60_000;
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('Расписание и звонки', () => {
  it('разрешает ученику вход при открытии окна и закрывает после окончания', () => {
    vi.useFakeTimers();
    const opensAt = new Date(event.start).getTime() - 5 * MINUTE_MS;
    vi.setSystemTime(opensAt - 1);
    const { result } = renderHook(() => useJoinWindow(event, false));
    expect(result.current.canJoin).toBe(false);
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.canJoin).toBe(true);
    expect(getCallButtonText(result.current.canJoin, result.current.isFuture)).toBe('Войти');
    act(() => vi.advanceTimersByTime(new Date(event.start).getTime() - Date.now() + 100));
    act(() => vi.advanceTimersByTime(new Date(event.end).getTime() - Date.now() + 100));
    expect(result.current.isEnded).toBe(true);
    expect(result.current.canJoin).toBe(false);
    expect(getCallButtonText(result.current.canJoin, result.current.isFuture)).toBe('Завершено');
  });

  it('преподаватель может войти заранее, некорректное время блокирует вход', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-18T08:00:00'));
    const teacher = renderHook(() => useJoinWindow(event, true));
    expect(teacher.result.current.canJoin).toBe(true);
    const invalid = renderHook(() => useJoinWindow({ ...event, end: 'invalid' }, true));
    expect(invalid.result.current.canJoin).toBe(false);
    expect(getCallButtonText(false, true)).toBe('Скоро');
  });

  it('выбирает ближайшее будущее занятие независимо от порядка', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-18T10:00:00'));
    const later = { ...event, id: 'later', start: '2026-10-19T12:30:00' };
    const past = { ...event, id: 'past', start: '2026-10-17T12:30:00', end: '2026-10-17T13:15:00' };
    expect(getClosestEvent([later, past, event])).toEqual(event);
    expect(getClosestEvent([past])).toBeNull();
    expect(getClosestEvent([])).toBeNull();
    expect(getClosestEvent(undefined)).toBeNull();
  });

  it('учитывает пересечения временных слотов и границы занятий', () => {
    const date = new Date(event.start);
    expect(isSlotEmpty([event], date, 12)).toBe(false);
    expect(isSlotEmpty([event], date, 13)).toBe(false);
    expect(isSlotEmpty([event], date, 14)).toBe(true);
    expect(isSlotEmpty([event], new Date('2026-10-19'), 12)).toBe(true);
    expect(getEventDurationMinutes(event.start, event.end)).toBe(45);
    expect(getEventTopPx(event, 12, 60)).toBe(30);
    expect(getEventHeightPx(event, 60)).toBe(45);
  });

  it('строит неделю с понедельника через границу года', () => {
    const sunday = new Date(2027, 0, 3);
    expect(getWeekStart(sunday)).toEqual(new Date(2026, 11, 28));
    const days = getWeekDays(sunday);
    expect(days).toHaveLength(7);
    expect(days[0]).toEqual(new Date(2026, 11, 28));
    expect(days[6]).toEqual(sunday);
  });

  it.each([0, 1, 9, 11])('сетка месяца %i содержит все дни по одному разу', (month) => {
    const grid = getMonthCalendarGrid(2026, month);
    expect(grid.every((week) => week.length === 7 && week[0].date.getDay() === 1)).toBe(true);
    const days = grid.flat().filter((day) => day.isCurrentMonth);
    expect(days).toHaveLength(new Date(2026, month + 1, 0).getDate());
    expect(new Set(days.map((day) => day.date.getDate())).size).toBe(days.length);
  });

  it('сохраняет локальное время при преобразовании формы в ISO', () => {
    const iso = localDateTimeToIso('2026-10-18', '12:30');
    expect(isoToLocalDateInput(iso)).toBe('2026-10-18');
    expect(isoToLocalTimeInput(iso)).toBe('12:30');
    expect(localDateTimeToIso('', '12:30')).toBe('');
    expect(isoToLocalDateInput('invalid')).toBe('');
    expect(isoToLocalTimeInput(null)).toBe('');
  });
});
