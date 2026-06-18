import { useEffect, useState } from 'react';
import { getMillisUntilWindowChange } from '@/Services/Scheduling/utils/time.utils';
import { JOIN_WINDOW_MINUTES } from '@/Services/Scheduling/Scheduling.const';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

const MS_PER_MINUTE = 60_000;

/**
 * Returns whether the join window for an event is currently open. Openness is
 * derived from a timestamp held in state; a single `setTimeout` advances that
 * timestamp exactly when the window opens — no polling, and no impure time
 * reads during render.
 */
export function useJoinWindow(event: ScheduleEvent): boolean {
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const millisUntilOpen = getMillisUntilWindowChange(event.start, JOIN_WINDOW_MINUTES);
    if (millisUntilOpen === null) return;

    const timer = setTimeout(() => setNowTs(Date.now()), millisUntilOpen);
    return () => clearTimeout(timer);
  }, [event.start, event.end, nowTs]);

  const opensAt = new Date(event.start).getTime() - JOIN_WINDOW_MINUTES * MS_PER_MINUTE;
  return nowTs >= opensAt && new Date(event.end).getTime() > nowTs;
}
