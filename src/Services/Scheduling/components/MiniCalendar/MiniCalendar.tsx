import { useState } from 'react';
import { Box, IconButton, Typography, ButtonBase } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { MONTH_NAMES_NOMINATIVE, WEEKDAY_SHORT_NAMES } from '@/Services/Scheduling/Scheduling.const';
import { getMonthCalendarGrid, isSameDay, isToday } from '@/Services/Scheduling/utils/time.utils';
import { styles } from './MiniCalendar.styles';

export interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function MiniCalendar({ selectedDate, onSelectDate }: MiniCalendarProps) {
  const currentSelectedKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
  const [prevSelectedKey, setPrevSelectedKey] = useState(currentSelectedKey);
  const [viewYear, setViewYear] = useState(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDate.getMonth());

  if (currentSelectedKey !== prevSelectedKey) {
    setPrevSelectedKey(currentSelectedKey);
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
  }

  const shiftMonth = (delta: -1 | 1) => {
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setViewMonth(nextMonth);
    setViewYear(nextYear);
  };

  const grid = getMonthCalendarGrid(viewYear, viewMonth);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.header}>
        <Typography sx={styles.monthTitle}>
          {MONTH_NAMES_NOMINATIVE[viewMonth]} {viewYear}
        </Typography>
        <Box sx={styles.navControls}>
          <IconButton
            size="small"
            aria-label="previous month"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeftIcon sx={styles.navIcon} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="next month"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRightIcon sx={styles.navIcon} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={styles.grid}>
        {WEEKDAY_SHORT_NAMES.map((w) => (
          <Box key={w} sx={styles.weekday}>
            {w}
          </Box>
        ))}

        {grid.flat().map(({ date, isCurrentMonth }) => {
          const isTodayDate = isToday(date);
          const isSelected = isSameDay(date, selectedDate);
          const key = date.toISOString();

          return (
            <ButtonBase
              key={key}
              component="button"
              aria-pressed={isSelected}
              aria-label={`выбрать ${date.getDate()}`}
              sx={styles.dayButton(isCurrentMonth, isTodayDate, isSelected)}
              onClick={() => onSelectDate(date)}
            >
              {date.getDate()}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
