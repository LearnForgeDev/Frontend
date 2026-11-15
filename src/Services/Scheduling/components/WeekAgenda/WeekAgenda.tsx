import { Box } from '@mui/material';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import { getWeekDays } from '../../utils/layout.utils';
import { getAgendaEvents, formatAgendaDate } from '../../utils/agenda.utils';
import { ScheduleEventList } from '../ScheduleEventList/ScheduleEventList';
import type { GridProps } from '../ScheduleGrid/ScheduleGrid.type';

export function WeekAgenda({ events, onSelectEvent }: GridProps) {
  const { selectedDate } = useSchedulingContext();
  return (
    <Box aria-label="Расписание на неделю" sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, sm: 3 }, minWidth: 0 }}>
      {getWeekDays(selectedDate).map(date => (
        <ScheduleEventList key={date.toISOString()} events={getAgendaEvents(events, date)} dateLabel={formatAgendaDate(date)} onSelectEvent={onSelectEvent} />
      ))}
    </Box>
  );
}
