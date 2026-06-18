// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CreateEventModal } from '../CreateEventModal';

const mutate = vi.fn();

vi.mock('@/Services/Scheduling/hooks/useSchoolMembers/useSchoolMembers', () => ({
  useSchoolMembers: () => ({ members: [{ userPublicId: 'u1', displayName: 'Ada' }], isLoading: false, isError: false, error: null }),
}));

vi.mock('@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations', () => ({
  useScheduleMutations: () => ({
    createEvent: { mutate, isPending: false },
    deleteEvent: { mutate: vi.fn(), isPending: false },
  }),
}));

afterEach(() => {
  cleanup();
  mutate.mockClear();
});

describe('CreateEventModal', () => {
  it('submits a well-formed payload', () => {
    render(<CreateEventModal onClose={() => {}} />);

    fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: 'Algebra' } });
    fireEvent.change(screen.getByLabelText(/^start$/i), { target: { value: '2026-06-18T14:00' } });
    fireEvent.change(screen.getByLabelText(/^end$/i), { target: { value: '2026-06-18T15:00' } });

    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    expect(mutate).toHaveBeenCalledTimes(1);
    const payload = mutate.mock.calls[0][0];
    expect(payload.title).toBe('Algebra');
    expect(typeof payload.startUtc).toBe('string');
    expect(typeof payload.endUtc).toBe('string');
    expect(payload.attendeeUserPublicIds).toEqual([]);
  });

  it('blocks submit when start is after end', () => {
    render(<CreateEventModal onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/^start$/i), { target: { value: '2026-06-18T16:00' } });
    fireEvent.change(screen.getByLabelText(/^end$/i), { target: { value: '2026-06-18T15:00' } });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByText(/start must be before end/i)).toBeTruthy();
  });
});
