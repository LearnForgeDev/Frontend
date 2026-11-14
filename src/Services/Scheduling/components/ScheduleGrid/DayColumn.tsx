import { Box, ButtonBase } from '@mui/material';
import { EventBlock } from '../EventBlock/EventBlock';
import { getHourSlots, isToday, getCurrentTimeOffsetPx, formatEventFullDateTime } from '../../utils/time.utils';
import { getPositionedDayEvents } from '../../utils/eventLayout.utils';
import { WIDGET_VISIBLE_START_HOUR, WIDGET_VISIBLE_END_HOUR, SLOT_HEIGHT_PX, WEEKDAY_SHORT_NAMES } from '../../Scheduling.const';
import type { DayColumnProps } from './ScheduleGrid.type';
import { styles } from './ScheduleGrid.styles';

export function DayColumn({ date, events, onSelectEvent, selectedEventId, onSelectTimeSlot }: DayColumnProps) {
  const hours = getHourSlots(WIDGET_VISIBLE_START_HOUR, WIDGET_VISIBLE_END_HOUR);
  const isTodayDate = isToday(date);
  const selectTime = (hour: number) => {
    const target = new Date(date);
    target.setHours(hour, 0, 0, 0);
    onSelectTimeSlot?.(target);
  };
  return (
    <Box sx={styles.column}>
      <Box sx={styles.columnHeader(isTodayDate)}>
        <Box sx={styles.headerWeekday}>{WEEKDAY_SHORT_NAMES[(date.getDay() + 6) % 7]}</Box>
        <Box sx={styles.headerDayNumber(isTodayDate)}>{date.getDate()}</Box>
      </Box>
      <Box sx={styles.columnBody(hours.length * SLOT_HEIGHT_PX)}>
        {hours.map(hour => {
          const key = `schedule-slot-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${hour}`;
          const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour);
          const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour + 1);
          return onSelectTimeSlot ? (
            <ButtonBase key={hour} data-testid={key} sx={styles.slotLine(true)} aria-label={`Новое занятие: ${formatEventFullDateTime(start.toISOString(), end.toISOString())}`} onClick={() => selectTime(hour)} />
          ) : <Box key={hour} data-testid={key} sx={styles.slotLine(false)} />;
        })}
        {isTodayDate && <Box sx={styles.currentTimeLine(getCurrentTimeOffsetPx(WIDGET_VISIBLE_START_HOUR, SLOT_HEIGHT_PX))}><Box sx={styles.currentTimeDot} /></Box>}
        {getPositionedDayEvents(events, date).map(item => (
          <Box key={item.event.id} sx={styles.eventLayer(item.top, item.height, item.column, item.columnCount)}>
            <EventBlock event={item.event} onSelect={onSelectEvent} selected={item.event.id === selectedEventId} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
