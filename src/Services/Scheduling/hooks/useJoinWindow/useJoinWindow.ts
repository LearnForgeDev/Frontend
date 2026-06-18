import { useEffect, useState } from 'react';
import { isWithinJoinWindow, getMillisUntilWindowChange } from '@/Services/Scheduling/utils/time.utils';
import { JOIN_WINDOW_MINUTES } from '@/Services/Scheduling/Scheduling.const';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

function computeIsOpen(event: ScheduleEvent): boolean {
  return (
    isWithinJoinWindow(event.start, JOIN_WINDOW_MINUTES) &&
    new Date(event.end).getTime() > Date.now()
  );
}

/**
 * Returns whether the join window for an event is currently open. When the
 * window is in the future it schedules a single `setTimeout` to flip the state
 * exactly when it opens — no polling.
 */
export function useJoinWindow(event: ScheduleEvent): boolean {
  const [isOpen, setIsOpen] = useState(() => computeIsOpen(event));

  useEffect(() => {
    setIsOpen(computeIsOpen(event));

    const millisUntilOpen = getMillisUntilWindowChange(event.start, JOIN_WINDOW_MINUTES);
    if (millisUntilOpen === null) {
      return;
    }

    const timer = setTimeout(() => setIsOpen(computeIsOpen(event)), millisUntilOpen);
    return () => clearTimeout(timer);
  }, [event.start, event.end]);

  return isOpen;
}
