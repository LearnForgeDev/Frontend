import type { ScheduleView } from '@/Storage/SchedulingContext/SchedulingContext';
import { getWeekDays } from './layout.utils';

export function formatSchedulePeriod(date: Date, view: ScheduleView): string {
  const formatDay = (value: Date) => value.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  if (view === 'day') {
    return `${formatDay(date)} ${date.getFullYear()}`;
  }
  const days = getWeekDays(date);
  const first = days[0];
  const last = days[6];
  if (first.getFullYear() !== last.getFullYear()) {
    return `${formatDay(first)} ${first.getFullYear()} – ${formatDay(last)} ${last.getFullYear()}`;
  }
  if (first.getMonth() !== last.getMonth()) {
    return `${formatDay(first)} – ${formatDay(last)} ${last.getFullYear()}`;
  }
  return `${first.getDate()}–${formatDay(last)} ${last.getFullYear()}`;
}
