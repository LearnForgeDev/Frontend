import type { AgendaListProps } from './AgendaList.type';
import { Box, Typography } from '@mui/material';
import { EventBlock } from '../EventBlock/EventBlock';

import { AGENDA_EMPTY_TEXT } from './AgendaList.const';
import { styles } from './ScheduleGrid.styles';

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
