import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import type { ScheduleEvent } from '../../Scheduling.types';
import { useSchoolId } from '../useSchoolId/useSchoolId';

export function useHandleEventIdParam(events: ScheduleEvent[], isSuccess: boolean) {
  const { setSelectedEventId, setSelectedDate } = useSchedulingContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const schoolId = useSchoolId();
  const targetEventId = searchParams.get('eventId');
  const targetEvent = events.find(event => event.id === targetEventId);
  const processedRef = useRef<string | null>(null);
  const targetKey = targetEventId ? `${schoolId}:${targetEventId}` : null;

  useEffect(() => {
    if (!targetKey) {
      processedRef.current = null;
      return;
    }
    if (!isSuccess || processedRef.current === targetKey || !targetEvent) return;
    processedRef.current = targetKey;
    setSelectedEventId(targetEvent.id);
    setSelectedDate(new Date(targetEvent.start));
  }, [targetKey, targetEvent, isSuccess, setSelectedEventId, setSelectedDate]);

  return {
    isUnavailable: Boolean(targetEventId && isSuccess && !targetEvent),
    dismiss: () => {
      const next = new URLSearchParams(searchParams);
      next.delete('eventId');
      setSearchParams(next, { replace: true });
    },
  };
}
