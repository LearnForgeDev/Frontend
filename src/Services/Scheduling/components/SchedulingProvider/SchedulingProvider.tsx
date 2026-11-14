import type { ScheduleView, SchedulingContextValue } from "@/Storage/SchedulingContext/SchedulingContext.type";

import { useState, useMemo, type ReactNode } from 'react';

import { getIsMobileDevice } from '@/Assets/device.utils';

import { SchedulingContext } from '@/Services/Scheduling/SchedulingContext.context';

export function SchedulingProvider({ children }: { children: ReactNode }) {
  const isMobile = getIsMobileDevice();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedView, setSelectedView] = useState<ScheduleView>(() => isMobile ? 'agenda' : 'week');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const view = isMobile && selectedView === 'week' ? 'agenda' : selectedView;

  const value = useMemo<SchedulingContextValue>(
    () => ({
      selectedDate,
      setSelectedDate,
      view,
      setView: setSelectedView,
      selectedEventId,
      setSelectedEventId,
    }),
    [selectedDate, view, selectedEventId],
  );

  return <SchedulingContext.Provider value={value}>{children}</SchedulingContext.Provider>;
}
