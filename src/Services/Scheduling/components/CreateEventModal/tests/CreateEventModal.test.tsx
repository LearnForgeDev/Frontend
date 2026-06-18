// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CreateEventModal } from '../CreateEventModal';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

const createMutate = vi.fn();
const updateMutate = vi.fn();

vi.mock('@/Services/Scheduling/hooks/useSchoolMembers/useSchoolMembers', () => ({
  useSchoolMembers: () => ({ members: [{ userPublicId: 'u1', displayName: 'Ada' }], isLoading: false, isError: false, error: null }),
}));

vi.mock('@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations', () => ({
  useScheduleMutations: () => ({
    createEvent: { mutate: createMutate, isPending: false },
    updateEvent: { mutate: updateMutate, isPending: false },
    deleteEvent: { mutate: vi.fn(), isPending: false },
  }),
}));

afterEach(() => {
  cleanup();
  createMutate.mockClear();
  updateMutate.mockClear();
});

describe('CreateEventModal', () => {
  it('submits a well-formed create payload', () => {
    render(<CreateEventModal onClose={() => {}} />);

    fireEvent.change(screen.getByLabelText(/название/i), { target: { value: 'Algebra' } });
    fireEvent.change(screen.getByLabelText(/^начало$/i), { target: { value: '2026-06-18T14:00' } });
    fireEvent.change(screen.getByLabelText(/^конец$/i), { target: { value: '2026-06-18T15:00' } });

    fireEvent.click(screen.getByRole('button', { name: /^создать$/i }));

    expect(createMutate).toHaveBeenCalledTimes(1);
    const payload = createMutate.mock.calls[0][0];
    expect(payload.title).toBe('Algebra');
    expect(typeof payload.startUtc).toBe('string');
    expect(typeof payload.endUtc).toBe('string');
    expect(payload.attendeeUserPublicIds).toEqual([]);
  });

  it('blocks submit when start is after end', () => {
    render(<CreateEventModal onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText(/название/i), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/^начало$/i), { target: { value: '2026-06-18T16:00' } });
    fireEvent.change(screen.getByLabelText(/^конец$/i), { target: { value: '2026-06-18T15:00' } });
    fireEvent.click(screen.getByRole('button', { name: /^создать$/i }));
    expect(createMutate).not.toHaveBeenCalled();
    expect(screen.getByText(/начало должно быть раньше конца/i)).toBeTruthy();
  });

  it('pre-fills and calls update in edit mode', () => {
    const event: ScheduleEvent = {
      id: 'e1', title: 'Algebra', description: 'q',
      start: '2026-06-18T14:00:00Z', end: '2026-06-18T15:00:00Z',
      room: 'room-e1', hostUserPublicId: 'h', attendees: [],
    };
    render(<CreateEventModal event={event} onClose={() => {}} />);

    expect((screen.getByLabelText(/название/i) as HTMLInputElement).value).toBe('Algebra');
    fireEvent.click(screen.getByRole('button', { name: /^сохранить$/i }));

    expect(updateMutate).toHaveBeenCalledTimes(1);
    expect(updateMutate.mock.calls[0][0].eventId).toBe('e1');
    expect(createMutate).not.toHaveBeenCalled();
  });
});
