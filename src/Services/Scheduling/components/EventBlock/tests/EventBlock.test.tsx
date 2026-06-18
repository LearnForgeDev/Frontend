// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventBlock } from '../EventBlock';
import { AttendeeAvatars } from '../../AttendeeAvatars/AttendeeAvatars';
import type { ScheduleEvent, Attendee } from '@/Services/Scheduling/Scheduling.types';

const event: ScheduleEvent = {
  id: 'e1', title: 'Algebra', description: null,
  start: '2026-06-18T14:00:00Z', end: '2026-06-18T15:30:00Z',
  room: 'r', hostUserPublicId: 'h', attendees: [],
};

const attendee = (i: number): Attendee => ({
  userPublicId: `u${i}`, displayName: `User ${i}`, role: 0, avatarUrl: null,
});

describe('EventBlock', () => {
  it('renders title and calls onSelect on click', () => {
    const onSelect = vi.fn();
    render(<EventBlock event={event} onSelect={onSelect} />);
    expect(screen.getByText('Algebra')).toBeTruthy();
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('e1');
  });
});

describe('AttendeeAvatars', () => {
  it('collapses into +N past the max', () => {
    render(<AttendeeAvatars attendees={[1, 2, 3, 4, 5, 6].map(attendee)} max={4} />);
    // AvatarGroup renders a surplus avatar "+N" when over max
    expect(screen.getByText('+3')).toBeTruthy();
  });

  it('renders nothing for no attendees', () => {
    const { container } = render(<AttendeeAvatars attendees={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
