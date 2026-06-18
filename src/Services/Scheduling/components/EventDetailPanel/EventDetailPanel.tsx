import { Box, Button, Divider, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AttendeeAvatars } from '@/Services/Scheduling/components/AttendeeAvatars/AttendeeAvatars';
import { JoinButton } from '@/Services/Scheduling/components/JoinButton/JoinButton';
import { formatEventTimeRange } from '@/Services/Scheduling/utils/time.utils';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { styles } from './EventDetailPanel.styles';

export interface EventDetailPanelProps {
  event: ScheduleEvent | null;
  canManage: boolean;
  onDelete: (id: string) => void;
  onEdit?: (event: ScheduleEvent) => void;
  isDeleting?: boolean;
}

export function EventDetailPanel({ event, canManage, onDelete, onEdit, isDeleting = false }: EventDetailPanelProps) {
  if (!event) {
    return (
      <Box sx={styles.root}>
        <Typography variant="body2" color="text.secondary">
          Выберите занятие, чтобы увидеть детали.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.root}>
      <Typography variant="h6" sx={styles.title}>
        {event.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={styles.time}>
        {formatEventTimeRange(event.start, event.end)}
      </Typography>

      {event.description && (
        <Typography variant="body2" sx={styles.description}>
          {event.description}
        </Typography>
      )}

      <Divider sx={styles.divider} />

      <Typography variant="caption" color="text.secondary">
        Участники
      </Typography>
      <Box sx={styles.attendees}>
        {event.attendees.length > 0 ? (
          <AttendeeAvatars attendees={event.attendees} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Пока нет участников.
          </Typography>
        )}
      </Box>

      <Box sx={styles.actions}>
        <JoinButton event={event} size="small" />
        {canManage && onEdit && (
          <Button
            color="primary"
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(event)}
          >
            Изменить
          </Button>
        )}
        {canManage && (
          <Button
            color="error"
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon />}
            disabled={isDeleting}
            onClick={() => onDelete(event.id)}
          >
            Удалить
          </Button>
        )}
      </Box>
    </Box>
  );
}
