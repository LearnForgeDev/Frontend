import { Box } from '@mui/material';
import { EventBlock } from '@/Services/Scheduling/components/EventBlock/EventBlock';
import { findEventsForDate, getHourSlots } from '@/Services/Scheduling/utils/time.utils';
import { getEventTopPx, getEventHeightPx } from '@/Services/Scheduling/utils/layout.utils';
import {
  WIDGET_VISIBLE_START_HOUR,
  WIDGET_VISIBLE_END_HOUR,
  SLOT_HEIGHT_PX,
} from '@/Services/Scheduling/Scheduling.const';
import type { DayColumnProps } from './ScheduleGrid.types';
import { styles } from './ScheduleGrid.styles';

const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** One day's stacked timeline of positioned event blocks. */
export function DayColumn({ date, events, onSelectEvent, selectedEventId, showHeader = true }: DayColumnProps & { showHeader?: boolean }) {
  const hours = getHourSlots(WIDGET_VISIBLE_START_HOUR, WIDGET_VISIBLE_END_HOUR);
  const bodyHeight = hours.length * SLOT_HEIGHT_PX;
  const dayEvents = findEventsForDate(events, date);
  const dow = (date.getUTCDay() + 6) % 7;

  return (
    <Box sx={styles.column}>
      {showHeader && (
        <Box sx={styles.columnHeader}>
          {WEEKDAY[dow]} {date.getUTCDate()}
        </Box>
      )}
      <Box sx={styles.columnBody(bodyHeight)}>
        {hours.map((h) => (
          <Box key={h} sx={styles.slotLine} />
        ))}
        {dayEvents.map((event) => (
          <Box
            key={event.id}
            sx={styles.eventLayer(
              getEventTopPx(event, WIDGET_VISIBLE_START_HOUR, SLOT_HEIGHT_PX),
              getEventHeightPx(event, SLOT_HEIGHT_PX),
            )}
          >
            <EventBlock
              event={event}
              onSelect={onSelectEvent}
              selected={event.id === selectedEventId}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
