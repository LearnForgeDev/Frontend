import { Box } from '@mui/material';
import { EventBlock } from '@/Services/Scheduling/components/EventBlock/EventBlock';
import { findEventsForDate, getHourSlots, isToday, getCurrentTimeOffsetPx } from '@/Services/Scheduling/utils/time.utils';
import { getEventTopPx, getEventHeightPx } from '@/Services/Scheduling/utils/layout.utils';
import {
  WIDGET_VISIBLE_START_HOUR,
  WIDGET_VISIBLE_END_HOUR,
  SLOT_HEIGHT_PX,
  WEEKDAY_SHORT_NAMES,
} from '@/Services/Scheduling/Scheduling.const';
import type { DayColumnProps } from './ScheduleGrid.types';
import { styles } from './ScheduleGrid.styles';

/** One day's stacked timeline of positioned event blocks. */
export function DayColumn({ date, events, onSelectEvent, selectedEventId, onSelectTimeSlot, showHeader = true }: DayColumnProps & { showHeader?: boolean }) {
  const hours = getHourSlots(WIDGET_VISIBLE_START_HOUR, WIDGET_VISIBLE_END_HOUR);
  const bodyHeight = hours.length * SLOT_HEIGHT_PX;
  const dayEvents = findEventsForDate(events, date);
  const dow = (date.getDay() + 6) % 7;
  const isTodayDate = isToday(date);
  const currentTimeTop = isTodayDate ? getCurrentTimeOffsetPx(WIDGET_VISIBLE_START_HOUR, SLOT_HEIGHT_PX) : 0;

  return (
    <Box sx={styles.column}>
      {showHeader && (
        <Box sx={styles.columnHeader(isTodayDate)}>
          <Box sx={styles.headerWeekday}>{WEEKDAY_SHORT_NAMES[dow]}</Box>
          <Box sx={styles.headerDayNumber(isTodayDate)}>{date.getDate()}</Box>
        </Box>
      )}
      <Box sx={styles.columnBody(bodyHeight)}>
        {hours.map((h) => (
          <Box
            key={h}
            sx={styles.slotLine(Boolean(onSelectTimeSlot))}
            onClick={() => {
              if (onSelectTimeSlot) {
                const target = new Date(date);
                target.setHours(h, 0, 0, 0);
                onSelectTimeSlot(target);
              }
            }}
          />
        ))}

        {isTodayDate && (
          <Box sx={styles.currentTimeLine(currentTimeTop)}>
            <Box sx={styles.currentTimeDot} />
          </Box>
        )}

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
