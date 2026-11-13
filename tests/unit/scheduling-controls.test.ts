import { createElement } from 'react';
import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthRole } from '@/Assets/Types/commonTypes';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.type';
import { AttendeeAvatars } from '@/Services/Scheduling/components/AttendeeAvatars/AttendeeAvatars';
import { useUpdateEventTitle } from '@/Services/Scheduling/hooks/useUpdateEventTitle/useUpdateEventTitle';
import { formatMonthYearTitle, getCurrentTimeOffsetPx, getHourSlots, formatLocalDateInput, formatLocalTimeInput, localDateTimeToIso, findEventsForDate } from '@/Services/Scheduling/utils/time.utils';
import { getTimeOfDay, getGradient } from '@/Services/AdminPanel/utils';

const update = vi.hoisted(() => vi.fn());
vi.mock('@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations', () => ({
  useScheduleMutations: () => ({ updateEvent: { mutate: update, isPending: false } }),
}));
const event: ScheduleEvent = {
  id: 'event', title: 'Урок', description: 'Описание', start: '2026-11-14T10:00:00', end: '2026-11-14T11:00:00',
  room: 'room', hostUserPublicId: 'teacher', attendees: [{ userPublicId: 'student', displayName: 'Иван Петров', role: AuthRole.STUDENT, avatarUrl: null }],
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  update.mockClear();
});

describe('Scheduling actions and local-time boundaries', () => {
  it('renames an event without losing its room, time or participants and rejects empty/no-op edits', () => {
    const initialProps: { current: ScheduleEvent | null } = { current: event };
    const { result, rerender } = renderHook(({ current }) => useUpdateEventTitle(current), { initialProps });
    act(() => result.current.saveTitle('  Урок  '));
    act(() => result.current.saveTitle('   '));
    expect(update).not.toHaveBeenCalled();
    act(() => result.current.saveTitle('  Новое название  '));
    expect(update).toHaveBeenCalledWith({ eventId: 'event', input: {
      title: 'Новое название', description: event.description, startUtc: event.start, endUtc: event.end,
      room: event.room, attendeeUserPublicIds: ['student'],
    } });
    rerender({ current: null });
    act(() => result.current.saveTitle('Другой урок'));
    expect(update).toHaveBeenCalledOnce();
  });

  it('renders attendee initials without dropping mononyms, blank names or image alternatives', () => {
    const view = render(createElement(AttendeeAvatars, { attendees: [] }));
    expect(view.container.childElementCount).toBe(0);
    view.rerender(createElement(AttendeeAvatars, { attendees: [
      event.attendees[0], { userPublicId: 'one', displayName: '  Анна  ', role: AuthRole.STUDENT, avatarUrl: null },
      { userPublicId: 'blank', displayName: ' ', role: AuthRole.STUDENT, avatarUrl: null },
      { userPublicId: 'photo', displayName: 'Фото', role: AuthRole.STUDENT, avatarUrl: 'https://image.invalid/avatar.png' },
    ], max: 5 }));
    expect(screen.getByText('ИП')).toBeTruthy();
    expect(screen.getByText('А')).toBeTruthy();
    expect(screen.getByText('?')).toBeTruthy();
    expect(screen.getByAltText('Фото').getAttribute('src')).toBe('https://image.invalid/avatar.png');
  });

  it('labels week ranges correctly across month and year boundaries', () => {
    expect(formatMonthYearTitle(new Date(2027, 0, 1), 'week')).toBe('Декабрь 2026 – Январь 2027');
    expect(formatMonthYearTitle(new Date(2026, 10, 30), 'week')).toBe('Ноябрь – Декабрь 2026');
    expect(formatMonthYearTitle(new Date(2026, 10, 18), 'week')).toBe('Ноябрь 2026');
    expect(formatMonthYearTitle(new Date(2026, 10, 18), 'day')).toBe('Ноябрь 2026');
    expect(getHourSlots(9, 11)).toEqual([9, 10, 11]);
    expect(getHourSlots(11, 9)).toEqual([]);
    expect(getCurrentTimeOffsetPx(9, 60, new Date(2026, 10, 14, 8))).toBe(0);
    expect(getCurrentTimeOffsetPx(9, 60, new Date(2026, 10, 14, 10, 30))).toBe(90);
    expect(findEventsForDate([event], new Date(2026, 10, 14))).toEqual([event]);
    expect(findEventsForDate([event], new Date(2026, 10, 15))).toEqual([]);
  });

  it('uses local calendar inputs and rejects incomplete or invalid date/time combinations', () => {
    const local = new Date(2026, 0, 2, 3, 4);
    expect(formatLocalDateInput(local)).toBe('2026-01-02');
    expect(formatLocalTimeInput(local)).toBe('03:04');
    expect(localDateTimeToIso('invalid', '03:04')).toBe('');
    expect(localDateTimeToIso('2026-01-02', '')).toBe('');
    expect(localDateTimeToIso('2026-01-02', '03:04')).toBe(local.toISOString());
  });

  it.each([[5, 'night'], [6, 'morning'], [12, 'day'], [18, 'evening']] as const)('changes the dashboard greeting at hour %i', (hour, period) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 14, hour));
    expect(getTimeOfDay()).toBe(period);
    expect(getGradient(period)).toContain('linear-gradient');
  });
});
