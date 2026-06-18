import { Box, Button, Divider, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AttendeeAvatars } from '@/Services/Scheduling/components/AttendeeAvatars/AttendeeAvatars';
import { JoinButton } from '@/Services/Scheduling/components/JoinButton/JoinButton';
import { formatEventTimeRange } from '@/Services/Scheduling/utils/time.utils';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { styles } from './EventDetailPanel.styles';

export interface EventDetailPanelProps {
  event: ScheduleEvent | null;
  canManage: boolean;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function EventDetailPanel({ event, canManage, onDelete, isDeleting = false }: EventDetailPanelProps) {
  if (!event) {
    return (
      <Box sx={styles.root}>
        <Typography variant="body2" color="text.secondary">
          Select a session to see its details.
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
        Attendees
      </Typography>
      <Box sx={styles.attendees}>
        {event.attendees.length > 0 ? (
          <AttendeeAvatars attendees={event.attendees} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No attendees yet.
          </Typography>
        )}
      </Box>

      <Box sx={styles.actions}>
        <JoinButton event={event} size="medium" />
        {canManage && (
          <Button
            color="error"
            variant="outlined"
            size="medium"
            startIcon={<DeleteIcon />}
            disabled={isDeleting}
            onClick={() => onDelete(event.id)}
          >
            Delete
          </Button>
        )}
      </Box>
    </Box>
  );
}
