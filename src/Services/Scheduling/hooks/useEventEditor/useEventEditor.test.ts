import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEventEditor } from './useEventEditor';
import type { ScheduleEvent } from '../../Scheduling.types';

const createEvent = { mutate: vi.fn(), isPending: false };
const updateEvent = { mutate: vi.fn(), isPending: false };
const students = {
  students: [{ publicId: 'anna', name: 'Анна' }, { publicId: 'ivan', name: 'Иван' }],
  studentIds: ['anna', 'ivan'], isLoading: false, isError: false, refetch: vi.fn(),
};
vi.mock('../useSchoolStudents/useSchoolStudents', () => ({ useSchoolStudents: () => students }));
vi.mock('../useScheduleMutations/useScheduleMutations', () => ({ useScheduleMutations: () => ({ createEvent, updateEvent }) }));

const options = { onClose: vi.fn(), initialDate: new Date('2026-10-21T12:00:00') };
const event: ScheduleEvent = {
  id: 'lesson', title: 'Математика', description: null, room: 'room', hostUserPublicId: 'teacher',
  start: '2026-10-21T10:00:00', end: '2026-10-21T11:00:00',
  attendees: [{ userPublicId: 'anna', displayName: 'Анна', role: 0, avatarUrl: null }],
};

beforeEach(() => { vi.clearAllMocks(); createEvent.isPending = false; students.isError = false; });
afterEach(cleanup);

describe('Выбор аудитории занятия', () => {
  it('не приглашает всю школу автоматически и требует осознанного выбора', () => {
    const { result } = renderHook(() => useEventEditor(options));
    expect(result.current.form.attendeeIds).toEqual([]);
    act(() => result.current.setField('title', 'Математика'));
    act(() => result.current.submit());
    expect(createEvent.mutate).not.toHaveBeenCalled();
    expect(result.current.form.error).toContain('Выберите участников');
    act(() => result.current.setAttendees(['anna']));
    act(() => result.current.submit());
    expect(createEvent.mutate).toHaveBeenCalledWith(expect.objectContaining({ attendeeUserPublicIds: ['anna'] }), expect.any(Object));
    expect(options.onClose).not.toHaveBeenCalled();
  });

  it('всех учеников добавляет только по отдельному действию', () => {
    const { result } = renderHook(() => useEventEditor(options));
    act(() => result.current.selectAllStudents());
    expect(result.current.form.attendeeIds).toEqual(['anna', 'ivan']);
  });

  it('разрешает явно выбранное занятие без учеников', () => {
    const { result } = renderHook(() => useEventEditor(options));
    act(() => { result.current.setField('title', 'Подготовка'); result.current.setWithoutAttendees(true); });
    act(() => result.current.submit());
    expect(createEvent.mutate).toHaveBeenCalledWith(expect.objectContaining({ attendeeUserPublicIds: [] }), expect.any(Object));
  });

  it('редактирование меняет аудиторию существующего занятия', () => {
    const { result } = renderHook(() => useEventEditor({ ...options, event }));
    expect(result.current.form.attendeeIds).toEqual(['anna']);
    act(() => result.current.setAttendees(['ivan']));
    act(() => result.current.submit());
    expect(updateEvent.mutate).toHaveBeenCalledWith(expect.objectContaining({ eventId: 'lesson', input: expect.objectContaining({ attendeeUserPublicIds: ['ivan'] }) }), expect.any(Object));
  });

  it('ошибка загрузки и выполняющееся сохранение блокируют отправку без потери формы', () => {
    const { result, rerender } = renderHook(() => useEventEditor(options));
    act(() => { result.current.setField('title', 'Математика'); result.current.selectAllStudents(); });
    students.isError = true;
    rerender();
    act(() => result.current.submit());
    students.isError = false;
    createEvent.isPending = true;
    rerender();
    act(() => result.current.submit());
    expect(createEvent.mutate).not.toHaveBeenCalled();
    expect(result.current.form.title).toBe('Математика');
    expect(result.current.form.attendeeIds).toEqual(['anna', 'ivan']);
  });
});
