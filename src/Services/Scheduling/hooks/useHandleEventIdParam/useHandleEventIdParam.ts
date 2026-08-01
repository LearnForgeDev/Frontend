import { useEffect, useRef, useState } from 'react';
import { extractQueryParam } from '@/Assets/globalUtils';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext.tsx';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';

export function useHandleEventIdParam(events: ScheduleEvent[], isLoading: boolean) {
  const { setSelectedEventId, setSelectedDate } = useSchedulingContext();
  const [targetEventId] = useState(() => extractQueryParam('eventId'));
  const processedRef = useRef(false);

  useEffect(() => {
    if (!targetEventId || processedRef.current || isLoading) {
      return;
    }

    processedRef.current = true;
    const targetEvent = events.find((e) => e.id === targetEventId);

    if (targetEvent) {
      setSelectedEventId(targetEvent.id);
      setSelectedDate(new Date(targetEvent.start));
    }
  }, [targetEventId, events, isLoading, setSelectedEventId, setSelectedDate]);
}
