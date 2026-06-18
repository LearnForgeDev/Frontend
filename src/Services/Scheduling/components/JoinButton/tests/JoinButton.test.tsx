// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JoinButton } from '../JoinButton';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

const mutate = vi.fn();

vi.mock('@/Services/Scheduling/hooks/useJoinMeeting/useJoinMeeting', () => ({
  useJoinMeeting: () => ({ mutate, isPending: false }),
}));

// Force the window open so the button is enabled.
vi.mock('@/Services/Scheduling/hooks/useJoinWindow/useJoinWindow', () => ({
  useJoinWindow: () => true,
}));

const event: ScheduleEvent = {
  id: 'e1', title: 'Algebra', description: null,
  start: '2026-06-18T14:00:00Z', end: '2026-06-18T15:00:00Z',
  room: 'room-e1', hostUserPublicId: 'h', attendees: [],
};

beforeEach(() => mutate.mockClear());

describe('JoinButton', () => {
  it('is enabled when the window is open and joins on click', () => {
    render(<JoinButton event={event} />);
    const btn = screen.getByRole('button', { name: /войти/i });
    expect((btn as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(btn);
    expect(mutate).toHaveBeenCalledWith(event);
  });
});
