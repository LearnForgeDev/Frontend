import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

export type ScheduleView = 'day' | 'week' | 'agenda';

export interface SchedulingContextValue {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  view: ScheduleView;
  setView: (view: ScheduleView) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
}

const SchedulingContext = createContext<SchedulingContextValue | undefined>(undefined);

export function SchedulingProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [view, setView] = useState<ScheduleView>('week');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const value = useMemo<SchedulingContextValue>(
    () => ({
      selectedDate,
      setSelectedDate,
      view,
      setView,
      selectedEventId,
      setSelectedEventId,
    }),
    [selectedDate, view, selectedEventId],
  );

  return <SchedulingContext.Provider value={value}>{children}</SchedulingContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSchedulingContext(): SchedulingContextValue {
  const context = useContext(SchedulingContext);
  if (!context) {
    throw new Error('useSchedulingContext must be used within a SchedulingProvider');
  }
  return context;
}
