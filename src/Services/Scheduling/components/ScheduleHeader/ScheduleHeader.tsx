import { Box, Button, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext.tsx';
import { formatMonthYearTitle } from '@/Services/Scheduling/utils/time.utils';
import { ViewToggle } from '@/Services/Scheduling/components/ScheduleGrid/ViewToggle';
import { HEADER_TITLE_TEXT, TODAY_BUTTON_TEXT } from './ScheduleHeader.const';
import { styles } from './ScheduleHeader.styles';

export function ScheduleHeader() {
  const { selectedDate, setSelectedDate, view } = useSchedulingContext();

  const shiftDate = (direction: 1 | -1) => {
    const step = view === 'week' ? 7 : 1;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + direction * step);
    setSelectedDate(next);
  };

  const handleGoToday = () => {
    setSelectedDate(new Date());
  };

  const dynamicTitle = formatMonthYearTitle(selectedDate, view);

  return (
    <Box component="header" sx={styles.root}>
      <Box sx={styles.leftGroup}>
        <Typography variant="h5" component="h1" sx={styles.heading}>
          {HEADER_TITLE_TEXT}
        </Typography>

        <Box sx={styles.navControls}>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            sx={styles.todayButton}
            onClick={handleGoToday}
          >
            {TODAY_BUTTON_TEXT}
          </Button>

          {view !== 'agenda' && (
            <>
              <IconButton
                aria-label="предыдущий период"
                onClick={() => shiftDate(-1)}
                size="small"
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                aria-label="следующий период"
                onClick={() => shiftDate(1)}
                size="small"
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}
        </Box>

        <Typography component="h2" sx={styles.monthYearTitle}>
          {dynamicTitle}
        </Typography>
      </Box>

      <Box sx={styles.rightGroup}>
        <ViewToggle />
      </Box>
    </Box>
  );
}
