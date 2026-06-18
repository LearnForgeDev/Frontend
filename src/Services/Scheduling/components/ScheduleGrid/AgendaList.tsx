import { Box, Typography } from '@mui/material';
import { EventBlock } from '@/Services/Scheduling/components/EventBlock/EventBlock';
import type { GridProps } from './ScheduleGrid.types';
import { styles } from './ScheduleGrid.styles';

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export function AgendaList({ events, onSelectEvent, selectedEventId }: GridProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  const groups = new Map<string, typeof sorted>();
  for (const e of sorted) {
    const key = dayKey(e.start);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  return (
    <Box sx={styles.agendaRoot}>
      {[...groups.entries()].map(([day, dayEvents]) => (
        <Box key={day}>
          <Typography sx={styles.agendaDay}>{day}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {dayEvents.map((event) => (
              <EventBlock
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
                selected={event.id === selectedEventId}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
