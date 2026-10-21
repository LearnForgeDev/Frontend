import { Box, Typography } from '@mui/material';
import { EventBlock } from '../EventBlock/EventBlock';
import type { GridProps } from './ScheduleGrid.types';
import { AGENDA_EMPTY_TEXT } from './AgendaList.const';
import { styles } from './ScheduleGrid.styles';

interface AgendaListProps extends GridProps {
  dateLabel: string;
}

export function AgendaList({ events, dateLabel, onSelectEvent, selectedEventId }: AgendaListProps) {
  return (
    <Box sx={styles.agendaRoot}>
      <Typography sx={styles.agendaDay}>{dateLabel}</Typography>
      {events.length === 0 && <Typography color="text.secondary" role="status">{AGENDA_EMPTY_TEXT}</Typography>}
      <Box sx={styles.agendaDayList}>
        {events.map(event => <EventBlock key={event.id} event={event} onSelect={onSelectEvent} selected={event.id === selectedEventId} />)}
      </Box>
    </Box>
  );
}
