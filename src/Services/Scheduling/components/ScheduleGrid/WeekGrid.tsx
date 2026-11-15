import { useRef, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import { getWeekDays } from '../../utils/layout.utils';
import { SLOT_HEIGHT_PX } from '../../Scheduling.const';
import { HourRail } from './HourRail';
import { DayColumn } from './DayColumn';
import { WeekAgenda } from '../WeekAgenda/WeekAgenda';
import type { GridProps } from './ScheduleGrid.type';
import { INITIAL_SCROLL_HOUR } from './ScheduleGrid.const';
import { styles } from './ScheduleGrid.styles';

export function WeekGrid(props: GridProps) {
  const { selectedDate } = useSchedulingContext();
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = INITIAL_SCROLL_HOUR * SLOT_HEIGHT_PX;
    }
  }, [isNarrow]);
  if (isNarrow) {
    return <WeekAgenda {...props} />;
  }
  return (
    <Box ref={scrollRef} sx={styles.weekRoot} aria-label="Временная сетка недели" tabIndex={0}>
      <HourRail withHeaderSpacer />
      {getWeekDays(selectedDate).map(day => <DayColumn key={day.toISOString()} date={day} {...props} />)}
    </Box>
  );
}
