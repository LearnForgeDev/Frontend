import { Box, Button } from '@mui/material';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { ProfileSectionItem } from '@/Services/Profile/components/ProfileSectionItem/ProfileSectionItem';
import { formatEventFullDateTime } from '../../utils/time.utils';
import type { SelectedScheduleEventProps } from './SelectedScheduleEvent.type';

export function SelectedScheduleEvent({ event, canManage, onOpen, onEdit, onDelete }: SelectedScheduleEventProps) {
  return (
    <Box data-testid="schedule-selected-event" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, px: { xs: 2, sm: 3 }, py: 1 }}>
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', minWidth: 0, flex: '1 1 240px' }}>
        <ProfileSectionItem icon={<EventNoteRoundedIcon />} title={event.title} details={formatEventFullDateTime(event.start, event.end)} actionLabel="Подробнее" onAction={() => onOpen(event.id)} />
      </Box>
      {canManage && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => onEdit(event)}>Изменить</Button>
          <Button color="error" onClick={() => onDelete(event.id)}>Удалить</Button>
        </Box>
      )}
    </Box>
  );
}
