import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { Modal } from '@/Assets/Components/Modal/Modal';
import { useSchoolStudents } from '@/Services/Scheduling/hooks/useSchoolStudents/useSchoolStudents';
import { useScheduleMutations } from '@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import {
  isoToLocalDateInput,
  isoToLocalTimeInput,
  formatLocalDateInput,
} from '@/Services/Scheduling/utils/time.utils';
import {
  MODAL_TITLE_CREATE,
  MODAL_TITLE_EDIT,
  LABEL_TITLE,
  LABEL_DESCRIPTION,
  LABEL_DATE,
  LABEL_START_TIME,
  LABEL_END_TIME,
  BUTTON_CANCEL,
  BUTTON_SUBMIT_CREATE,
  BUTTON_SUBMIT_EDIT,
  STUDENTS_LOADING_TEXT,
  STUDENTS_ERROR_TEXT,
  STUDENTS_RETRY_TEXT,
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
} from './CreateEventModal.const';
import { validateScheduleEventForm } from './CreateEventModal.validation';
import { styles } from './CreateEventModal.styles';

export interface CreateEventModalProps {
  onClose: () => void;
  /** When provided, the modal edits this event instead of creating a new one. */
  event?: ScheduleEvent | null;
  /** Initial date selected in the calendar when opening the create dialog. */
  initialDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
}

export function CreateEventModal({ onClose, event = null, initialDate, initialStartTime, initialEndTime }: CreateEventModalProps) {
  const isEdit = !!event;
  const {
    studentIds,
    isLoading: studentsLoading,
    isError: studentsError,
    refetch: refetchStudents,
  } = useSchoolStudents();
  const { createEvent, updateEvent } = useScheduleMutations();
  const mutation = isEdit ? updateEvent : createEvent;

  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [date, setDate] = useState(() =>
    event ? isoToLocalDateInput(event.start) : formatLocalDateInput(initialDate),
  );
  const [startTime, setStartTime] = useState(() =>
    event ? isoToLocalTimeInput(event.start) : (initialStartTime ?? DEFAULT_START_TIME),
  );
  const [endTime, setEndTime] = useState(() =>
    event ? isoToLocalTimeInput(event.end) : (initialEndTime ?? DEFAULT_END_TIME),
  );
  const [error, setError] = useState<string | null>(null);
  const isAudienceUnavailable = !isEdit && (studentsLoading || studentsError);

  const handleSubmit = () => {
    const validation = validateScheduleEventForm({ title, date, startTime, endTime });
    if (validation.error !== null) {
      setError(validation.error);
      return;
    }
    setError(null);

    const input = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      startUtc: validation.startUtc,
      endUtc: validation.endUtc,
      room: event?.room,
      attendeeUserPublicIds: event
        ? event.attendees.map((attendee) => attendee.userPublicId)
        : studentIds,
    };

    if (isEdit && event) {
      updateEvent.mutate({ eventId: event.id, input }, { onSuccess: onClose });
    } else {
      createEvent.mutate(input, { onSuccess: onClose });
    }
  };

  return (
    <Modal title={isEdit ? MODAL_TITLE_EDIT : MODAL_TITLE_CREATE} onClose={onClose}>
      <Box sx={styles.form}>
        <TextField
          label={LABEL_TITLE}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label={LABEL_DESCRIPTION}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
        <TextField
          label={LABEL_DATE}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
          fullWidth
        />
        <Box sx={styles.row}>
          <TextField
            label={LABEL_START_TIME}
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            required
            fullWidth
          />
          <TextField
            label={LABEL_END_TIME}
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            required
            fullWidth
          />
        </Box>
        {!isEdit && studentsLoading && (
          <Box sx={styles.studentsStatus} role="status">
            <ClipLoader size={18} />
            <Typography variant="body2" color="text.secondary">
              {STUDENTS_LOADING_TEXT}
            </Typography>
          </Box>
        )}

        {!isEdit && studentsError && (
          <Alert
            severity="error"
            action={<Button onClick={refetchStudents}>{STUDENTS_RETRY_TEXT}</Button>}
          >
            {STUDENTS_ERROR_TEXT}
          </Alert>
        )}

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        <Box sx={styles.actions}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            {BUTTON_CANCEL}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={mutation.isPending || isAudienceUnavailable}
          >
            {isEdit ? BUTTON_SUBMIT_EDIT : BUTTON_SUBMIT_CREATE}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
