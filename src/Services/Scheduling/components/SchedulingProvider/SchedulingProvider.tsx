import type { ScheduleView, SchedulingContextValue } from "@/Storage/SchedulingContext/SchedulingContext.type";

import { useState, useMemo, type ReactNode } from 'react';

import { useMediaQuery, useTheme } from '@mui/material';

import { SchedulingContext } from '@/Services/Scheduling/SchedulingContext.context';

export function SchedulingProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedView, setSelectedView] = useState<ScheduleView>(() => isMobile ? 'day' : 'week');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const view = selectedView;

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
