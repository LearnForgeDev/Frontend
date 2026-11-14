

export type ScheduleView = 'day' | 'week' | 'agenda';

export interface SchedulingContextValue {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  view: ScheduleView;
  setView: (view: ScheduleView) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
}
