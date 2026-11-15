import { Box, Button, Tooltip, Typography } from '@mui/material';
import { formatEventTimeRange, getEventDurationMinutes } from '../../utils/time.utils';
import { SLOT_HEIGHT_PX } from '../../Scheduling.const';
import type { EventBlockProps } from './EventBlock.type';
import { styles } from './EventBlock.styles';

export function EventBlock({ event, onSelect, selected = false, sized = false }: EventBlockProps) {
  const duration = getEventDurationMinutes(event.start, event.end);
  const height = sized ? Math.max(24, duration / 60 * SLOT_HEIGHT_PX) : undefined;
  const label = `${event.title} · ${formatEventTimeRange(event.start, event.end)}`;
  return (
    <Tooltip title={label}>
      <Button aria-label={label} aria-pressed={selected} sx={styles.root(selected, height)} onClick={() => onSelect?.(event.id)}>
        <Box sx={{ minWidth: 0, width: '100%' }}>
          {duration >= 45 && <Typography component="span" sx={styles.time}>{formatEventTimeRange(event.start, event.end)}</Typography>}
          <Typography component="span" sx={styles.title}>{event.title}</Typography>
        </Box>
      </Button>
    </Tooltip>
  );
}
