import { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext.tsx';
import { getWeekDays } from '@/Services/Scheduling/utils/layout.utils';
import { SLOT_HEIGHT_PX } from '@/Services/Scheduling/Scheduling.const';
import { HourRail } from './HourRail';
import { DayColumn } from './DayColumn';
import type { GridProps } from './ScheduleGrid.types';
import { INITIAL_SCROLL_HOUR } from './ScheduleGrid.const';
import { styles } from './ScheduleGrid.styles';

export function WeekGrid({ events, onSelectEvent, selectedEventId, onSelectTimeSlot }: GridProps) {
  const { selectedDate } = useSchedulingContext();
  const days = getWeekDays(selectedDate);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Proactively scroll grid viewport to 10:00 AM on initial load per design requirement
      scrollRef.current.scrollTop = INITIAL_SCROLL_HOUR * SLOT_HEIGHT_PX;
    }
  }, []);

  return (
    <Box ref={scrollRef} sx={styles.weekRoot}>
      <HourRail withHeaderSpacer />
      {days.map((day) => (
        <DayColumn
          key={day.toISOString()}
          date={day}
          events={events}
          onSelectEvent={onSelectEvent}
          selectedEventId={selectedEventId}
          onSelectTimeSlot={onSelectTimeSlot}
        />
      ))}
    </Box>
  );
}
