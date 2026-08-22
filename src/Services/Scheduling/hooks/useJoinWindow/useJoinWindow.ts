import { useEffect, useState } from 'react';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import {
  MAX_TIMER_DELAY_MS,
  MILLISECONDS_PER_MINUTE,
  STUDENT_JOIN_WINDOW_MINUTES,
  TIMER_TRANSITION_TOLERANCE_MS,
} from './useJoinWindow.const';

export interface JoinWindowState {
  canJoin: boolean;
  isFuture: boolean;
  isEnded: boolean;
}

/** Keeps the meeting phase current at the student-access, start, and end boundaries. */
export function useJoinWindow(event: ScheduleEvent, canManage: boolean): JoinWindowState {
  const [nowTs, setNowTs] = useState(() => Date.now());
  const startTs = new Date(event.start).getTime();
  const endTs = new Date(event.end).getTime();
  const hasValidInterval = Number.isFinite(startTs) && Number.isFinite(endTs) && endTs > startTs;
  const studentOpensAt = startTs - STUDENT_JOIN_WINDOW_MINUTES * MILLISECONDS_PER_MINUTE;

  useEffect(() => {
    const transitions = [studentOpensAt, startTs, endTs].filter((transition) => transition > nowTs);
    if (transitions.length === 0) return;

    const nextTransition = Math.min(...transitions);
    const delay = Math.min(
      nextTransition - nowTs + TIMER_TRANSITION_TOLERANCE_MS,
      MAX_TIMER_DELAY_MS,
    );
    const timer = setTimeout(() => setNowTs(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [studentOpensAt, startTs, endTs, nowTs]);

  const isFuture = hasValidInterval && nowTs < startTs;
  const isEnded = !hasValidInterval || nowTs >= endTs;
  const canJoin = hasValidInterval && !isEnded && (canManage || nowTs >= studentOpensAt);

  return { canJoin, isFuture, isEnded };
}
