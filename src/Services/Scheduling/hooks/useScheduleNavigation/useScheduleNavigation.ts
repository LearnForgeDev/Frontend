import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import { formatMonthYearTitle } from '../../utils/time.utils';
import { DAYS_IN_WEEK } from './useScheduleNavigation.const';

export function useScheduleNavigation() {
  const { selectedDate, setSelectedDate, view } = useSchedulingContext();
  const shiftDate = (direction: 1 | -1) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + direction * (view === 'week' ? DAYS_IN_WEEK : 1));
    setSelectedDate(next);
  };
  return {
    title: formatMonthYearTitle(selectedDate, view),
    goToday: () => setSelectedDate(new Date()),
    goPrevious: () => shiftDate(-1),
    goNext: () => shiftDate(1),
  };
}
