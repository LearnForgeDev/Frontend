import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import { formatSchedulePeriod } from '../../utils/period.utils';
import { DAYS_IN_WEEK } from './useScheduleNavigation.const';

export function useScheduleNavigation() {
  const { selectedDate, setSelectedDate, view } = useSchedulingContext();
  const shiftDate = (direction: 1 | -1) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + direction * (view === 'day' ? 1 : DAYS_IN_WEEK));
    setSelectedDate(next);
  };
  return {
    title: formatSchedulePeriod(selectedDate, view),
    previousLabel: view === 'day' ? 'Предыдущий день' : 'Предыдущая неделя',
    nextLabel: view === 'day' ? 'Следующий день' : 'Следующая неделя',
    goToday: () => setSelectedDate(new Date()),
    goPrevious: () => shiftDate(-1),
    goNext: () => shiftDate(1),
  };
}
