import { useEffect, useState } from 'react';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { getNextTodayRefreshAt } from './useTodayClock.utils';
import { MIN_CLOCK_DELAY_MS } from './useTodayClock.const';

export function useTodayClock(events: ScheduleEvent[]): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const delay = Math.max(MIN_CLOCK_DELAY_MS, getNextTodayRefreshAt(events, now) - Date.now());
    const timer = setTimeout(() => setNow(new Date()), delay);
    return () => clearTimeout(timer);
  }, [events, now]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') setNow(new Date());
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => document.removeEventListener('visibilitychange', refreshWhenVisible);
  }, []);

  return now;
}
