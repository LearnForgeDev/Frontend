import { Box } from '@mui/material';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import { getHourSlots } from '@/Services/Scheduling/utils/time.utils';
import { WIDGET_VISIBLE_START_HOUR, WIDGET_VISIBLE_END_HOUR } from '@/Services/Scheduling/Scheduling.const';
import { styles } from './ScheduleGrid.styles';

export function HourRail({ withHeaderSpacer = false }: { withHeaderSpacer?: boolean }) {
  const { selectedDate } = useSchedulingContext();
  const zone = new Intl.DateTimeFormat('ru-RU', { timeZoneName: 'short' }).formatToParts(selectedDate).find(part => part.type === 'timeZoneName')?.value;
  const hours = getHourSlots(WIDGET_VISIBLE_START_HOUR, WIDGET_VISIBLE_END_HOUR);
  return (
    <Box sx={styles.hourRail}>
      {withHeaderSpacer && <Box sx={styles.hourRailSpacer}>{zone}</Box>}
      {hours.map((h) => (
        <Box key={h} sx={styles.hourLabel}>
          {String(h).padStart(2, '0')}:00
        </Box>
      ))}
    </Box>
  );
}
