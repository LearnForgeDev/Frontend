import { Box } from '@mui/material';
import { useSchedulingContext } from '@/Storage/Context/SchedulingContext';
import { HourRail } from './HourRail';
import { DayColumn } from './DayColumn';
import type { GridProps } from './ScheduleGrid.types';
import { styles } from './ScheduleGrid.styles';

export function DayGrid({ events, onSelectEvent, selectedEventId }: GridProps) {
  const { selectedDate } = useSchedulingContext();
  return (
    <Box sx={styles.weekRoot}>
      <HourRail withHeaderSpacer />
      <DayColumn
        date={selectedDate}
        events={events}
        onSelectEvent={onSelectEvent}
        selectedEventId={selectedEventId}
      />
    </Box>
  );
}
