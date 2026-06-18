import { Box } from '@mui/material';
import { getHourSlots } from '@/Services/Scheduling/utils/time.utils';
import { WIDGET_VISIBLE_START_HOUR, WIDGET_VISIBLE_END_HOUR } from '@/Services/Scheduling/Scheduling.const';
import { styles } from './ScheduleGrid.styles';

/** Left rail of hour labels, aligned to the day/week grid slots. */
export function HourRail({ withHeaderSpacer = false }: { withHeaderSpacer?: boolean }) {
  const hours = getHourSlots(WIDGET_VISIBLE_START_HOUR, WIDGET_VISIBLE_END_HOUR);
  return (
    <Box sx={styles.hourRail}>
      {withHeaderSpacer && <Box sx={styles.columnHeader} />}
      {hours.map((h) => (
        <Box key={h} sx={styles.hourLabel}>
          {String(h).padStart(2, '0')}:00
        </Box>
      ))}
    </Box>
  );
}
