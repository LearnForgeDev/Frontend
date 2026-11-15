import { Box, Typography } from '@mui/material';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { ProfileSectionItem } from '@/Services/Profile/components/ProfileSectionItem/ProfileSectionItem';
import { formatEventFullDateTime } from '../../utils/time.utils';
import type { ScheduleEventListProps } from './ScheduleEventList.type';

export function ScheduleEventList({ events, dateLabel, onSelectEvent, emptyText = 'На этот день занятий нет.' }: ScheduleEventListProps) {
  return (
    <Box component="section" aria-label={dateLabel}>
      <Typography component="h2" sx={{ fontSize: '1.2rem', fontWeight: 800, mb: 2, '&::first-letter': { textTransform: 'uppercase' } }}>{dateLabel}</Typography>
      {events.length === 0 && <Typography color="text.secondary" role="status">{emptyText}</Typography>}
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {events.map(event => (
          <ProfileSectionItem
            key={event.id}
            icon={<EventNoteRoundedIcon />}
            title={event.title}
            details={formatEventFullDateTime(event.start, event.end)}
            actionLabel="Открыть занятие"
            onAction={() => onSelectEvent(event.id)}
          />
        ))}
      </Box>
    </Box>
  );
}
