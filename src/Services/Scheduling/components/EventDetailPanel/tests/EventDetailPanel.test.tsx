// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(cleanup);
import { EventDetailPanel } from '../EventDetailPanel';
import { UpcomingEventsList } from '../../UpcomingEventsList/UpcomingEventsList';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

vi.mock('@/Services/Scheduling/components/JoinButton/JoinButton', () => ({
  JoinButton: () => <button type="button">Join</button>,
}));

const event: ScheduleEvent = {
  id: 'e1', title: 'Algebra', description: 'Quadratics',
  start: '2999-06-18T14:00:00Z', end: '2999-06-18T15:00:00Z',
  room: 'r', hostUserPublicId: 'h', attendees: [],
};

describe('EventDetailPanel', () => {
  it('shows Delete only when canManage', () => {
    const onDelete = vi.fn();
    const { rerender } = render(<EventDetailPanel event={event} canManage={false} onDelete={onDelete} />);
    expect(screen.queryByRole('button', { name: /удалить/i })).toBeNull();

    rerender(<EventDetailPanel event={event} canManage onDelete={onDelete} />);
    const del = screen.getByRole('button', { name: /удалить/i });
    fireEvent.click(del);
    expect(onDelete).toHaveBeenCalledWith('e1');
  });

  it('prompts to select when no event', () => {
    render(<EventDetailPanel event={null} canManage onDelete={() => {}} />);
    expect(screen.getByText(/выберите занятие/i)).toBeTruthy();
  });
});

describe('UpcomingEventsList', () => {
  it('lists only future events', () => {
    const past: ScheduleEvent = { ...event, id: 'old', title: 'Past', start: '2000-01-01T00:00:00Z', end: '2000-01-01T01:00:00Z' };
    render(<UpcomingEventsList events={[event, past]} onSelect={() => {}} selectedEventId={null} />);
    expect(screen.getByText('Algebra')).toBeTruthy();
    expect(screen.queryByText('Past')).toBeNull();
  });
});
