import { Box } from '@mui/material';
import { useSchedulingContext } from '@/Storage/Context/SchedulingContext';
import { getWeekDays } from '@/Services/Scheduling/utils/layout.utils';
import { HourRail } from './HourRail';
import { DayColumn } from './DayColumn';
import type { GridProps } from './ScheduleGrid.types';
import { styles } from './ScheduleGrid.styles';

export function WeekGrid({ events, onSelectEvent, selectedEventId }: GridProps) {
  const { selectedDate } = useSchedulingContext();
  const days = getWeekDays(selectedDate);

  return (
    <Box sx={styles.weekRoot}>
      <HourRail withHeaderSpacer />
      {days.map((day) => (
        <DayColumn
          key={day.toISOString()}
          date={day}
          events={events}
          onSelectEvent={onSelectEvent}
          selectedEventId={selectedEventId}
        />
      ))}
    </Box>
  );
}
