import { Box, Typography } from '@mui/material';
import { formatEventTimeRange, getEventDurationMinutes } from '@/Services/Scheduling/utils/time.utils';
import { SLOT_HEIGHT_PX } from '@/Services/Scheduling/Scheduling.const';
import type { EventBlockProps } from './EventBlock.types';
import { styles } from './EventBlock.styles';

export function EventBlock({ event, onSelect, selected = false, sized = false }: EventBlockProps) {
  const height = sized
    ? Math.max(24, (getEventDurationMinutes(event.start, event.end) / 60) * SLOT_HEIGHT_PX)
    : undefined;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      sx={{ ...styles.root(selected), height }}
      onClick={() => onSelect?.(event.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect?.(event.id);
      }}
    >
      <Typography component="div" sx={styles.time}>
        {formatEventTimeRange(event.start, event.end)}
      </Typography>
      <Typography component="div" sx={styles.title}>
        {event.title}
      </Typography>
    </Box>
  );
}
