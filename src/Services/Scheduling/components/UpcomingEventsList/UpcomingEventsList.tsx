import { useState } from 'react';
import { Box, List, ListItemButton, Typography } from '@mui/material';
import { formatEventTimeRange } from '@/Services/Scheduling/utils/time.utils';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { styles } from './UpcomingEventsList.styles';

export interface UpcomingEventsListProps {
  events: ScheduleEvent[];
  onSelect: (id: string) => void;
  selectedEventId: string | null;
}

export function UpcomingEventsList({ events, onSelect, selectedEventId }: UpcomingEventsListProps) {
  const [now] = useState(() => Date.now());
  const upcoming = events
    .filter((e) => new Date(e.end).getTime() > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (upcoming.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={styles.empty}>
        No upcoming sessions.
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
