import { Dialog, DialogContent, IconButton, Box, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { EventDetailPanel } from '@/Services/Scheduling/components/EventDetailPanel/EventDetailPanel';
import { buildGoogleCalendarUrl } from '@/Services/Scheduling/utils/gcalendar.utils';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import {
  CLOSE_ARIA_LABEL,
  DIALOG_ARIA_LABEL,
  EDIT_TOOLTIP,
  DELETE_TOOLTIP,
  GCAL_TOOLTIP,
} from './EventDetailModal.const';
import { styles } from './EventDetailModal.styles';

export interface EventDetailModalProps {
  event: ScheduleEvent | null;
  canManage: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onEdit?: (event: ScheduleEvent) => void;
  onDelete: (id: string) => void;
}

export function EventDetailModal({
  event,
  canManage,
  isDeleting,
  onClose,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  const open = Boolean(event);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-label={DIALOG_ARIA_LABEL}
      slotProps={{ paper: { sx: styles.dialogPaper } }}
    >
      <Box sx={styles.header}>
        {event && canManage && onEdit && (
          <Tooltip title={EDIT_TOOLTIP}>
            <IconButton
              size="small"
              onClick={() => onEdit(event)}
              aria-label={EDIT_TOOLTIP}
              sx={styles.actionButton}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {event && canManage && (
          <Tooltip title={DELETE_TOOLTIP}>
            <IconButton
              size="small"
              onClick={() => onDelete(event.id)}
              disabled={isDeleting}
              aria-label={DELETE_TOOLTIP}
              sx={styles.deleteButton}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        {event && (
          <Tooltip title={GCAL_TOOLTIP}>
            <IconButton
              size="small"
              component="a"
              href={buildGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={GCAL_TOOLTIP}
              sx={styles.actionButton}
            >
              <CalendarTodayIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={CLOSE_ARIA_LABEL}>
          <IconButton
            size="small"
            aria-label={CLOSE_ARIA_LABEL}
            onClick={onClose}
            sx={styles.actionButton}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <DialogContent sx={styles.content}>
        <EventDetailPanel
          event={event}
          canManage={canManage}
        />
      </DialogContent>
    </Dialog>
  );
}
