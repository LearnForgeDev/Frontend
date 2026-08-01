import { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SubjectIcon from '@mui/icons-material/Subject';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import VideocamIcon from '@mui/icons-material/Videocam';
import { AttendeeAvatars } from '@/Services/Scheduling/components/AttendeeAvatars/AttendeeAvatars';
import { JoinButton } from '@/Services/Scheduling/components/JoinButton/JoinButton';
import { formatEventFullDateTime } from '@/Services/Scheduling/utils/time.utils';
import { useUpdateEventTitle } from '@/Services/Scheduling/hooks/useUpdateEventTitle/useUpdateEventTitle';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import {
  EVENT_DETAIL_SELECT_PROMPT,
  EVENT_DETAIL_NO_ATTENDEES,
  EVENT_DETAIL_EDIT_TITLE_HINT,
  EVENT_DETAIL_TITLE_ARIA,
} from './EventDetailPanel.const';
import { styles } from './EventDetailPanel.styles';

export interface EventDetailPanelProps {
  event: ScheduleEvent | null;
  canManage: boolean;
}

export function EventDetailPanel({ event, canManage }: EventDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const { saveTitle } = useUpdateEventTitle(event);

  const startEditing = () => {
    if (!canManage || !event) return;
    setTitleValue(event.title);
    setIsEditing(true);
  };

  const handleFinishEdit = () => {
    if (isEditing) {
      saveTitle(titleValue);
      setIsEditing(false);
    }
  };

  if (!event) {
    return (
      <Box sx={styles.root}>
        <Typography variant="body2" color="text.secondary">
          {EVENT_DETAIL_SELECT_PROMPT}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.root}>
      <Box sx={styles.row}>
        <Box sx={styles.iconColumn}>
          <Box sx={styles.colorDot} />
        </Box>
        <Box sx={styles.contentColumn}>
          {isEditing ? (
            <TextField
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleFinishEdit();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                }
              }}
              autoFocus
              size="small"
              variant="standard"
              slotProps={{
                input: { sx: styles.titleInput },
              }}
              aria-label={EVENT_DETAIL_TITLE_ARIA}
            />
          ) : (
            <Box
              sx={[styles.titleContainer, canManage && styles.editableTitle]}
              onClick={startEditing}
              title={canManage ? EVENT_DETAIL_EDIT_TITLE_HINT : undefined}
            >
              <Typography variant="h6" sx={styles.title}>
                {event.title}
              </Typography>
              {canManage && <EditIcon sx={styles.editTitleIcon} className="edit-title-icon" />}
            </Box>
          )}
          <Typography variant="body2" sx={styles.time}>
            {formatEventFullDateTime(event.start, event.end)}
          </Typography>
        </Box>
      </Box>

      <Box sx={styles.row}>
        <Box sx={styles.iconColumn}>
          <VideocamIcon sx={styles.rowIcon} />
        </Box>
        <Box sx={styles.contentColumn}>
          <JoinButton event={event} size="medium" />
        </Box>
      </Box>

      {event.description && (
        <Box sx={styles.row}>
          <Box sx={styles.iconColumn}>
            <SubjectIcon sx={styles.rowIcon} />
          </Box>
          <Box sx={styles.contentColumn}>
            <Typography variant="body2" sx={styles.description}>
              {event.description}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={styles.row}>
        <Box sx={styles.iconColumn}>
          <PeopleOutlinedIcon sx={styles.rowIcon} />
        </Box>
        <Box sx={styles.contentColumn}>
          {event.attendees.length > 0 ? (
            <AttendeeAvatars attendees={event.attendees} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {EVENT_DETAIL_NO_ATTENDEES}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

