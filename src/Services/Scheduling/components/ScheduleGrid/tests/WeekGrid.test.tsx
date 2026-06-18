// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { WeekGrid } from '../WeekGrid';
import { SchedulingProvider } from '@/Storage/Context/SchedulingContext';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

afterEach(() => vi.useRealTimers());

const event: ScheduleEvent = {
  id: 'e1', title: 'Algebra', description: null,
  start: '2026-06-18T14:00:00Z', end: '2026-06-18T15:00:00Z',
  room: 'r', hostUserPublicId: 'h', attendees: [],
};

describe('WeekGrid', () => {
  it('renders 7 day columns and places the event in its day', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-06-18T09:00:00Z'));
    render(
      <SchedulingProvider>
        <WeekGrid events={[event]} onSelectEvent={() => {}} selectedEventId={null} />
      </SchedulingProvider>,
    );

    // Monday..Sunday headers → 15..21
    expect(screen.getByText(/Thu 18/)).toBeTruthy();
    expect(screen.getByText(/Mon 15/)).toBeTruthy();
    expect(screen.getByText(/Sun 21/)).toBeTruthy();
    // The event appears once in the grid
    expect(screen.getByText('Algebra')).toBeTruthy();
  });
});
