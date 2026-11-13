import type { UpcomingEventsListProps } from './UpcomingEventsList.type';
export type { UpcomingEventsListProps } from './UpcomingEventsList.type';
import { useState } from 'react';
import { Box, List, ListItemButton, Typography } from '@mui/material';
import { formatEventTimeRange } from '@/Services/Scheduling/utils/time.utils';

import { styles } from './UpcomingEventsList.styles';

export function UpcomingEventsList({ events, onSelect, selectedEventId }: UpcomingEventsListProps) {
  const [now] = useState(() => Date.now());
  const upcoming = events
    .filter((e) => new Date(e.end).getTime() > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (upcoming.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={styles.empty}>
        Нет предстоящих занятий.
      </Typography>
    );
  }

  return (
    <List dense disablePadding>
      {upcoming.map((event) => (
        <ListItemButton
          key={event.id}
          selected={event.id === selectedEventId}
          onClick={() => onSelect(event.id)}
          sx={styles.item}
        >
          <Box>
            <Typography sx={styles.title}>{event.title}</Typography>
            <Typography sx={styles.time}>
              {formatEventTimeRange(event.start, event.end)}
            </Typography>
          </Box>
        </ListItemButton>
      ))}
    </List>
  );
}
