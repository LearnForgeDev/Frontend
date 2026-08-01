import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Modal } from '@/Assets/Components/Modal/Modal';
import { useSchoolMembers } from '@/Services/Scheduling/hooks/useSchoolMembers/useSchoolMembers';
import { useScheduleMutations } from '@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import {
  isoToLocalDateInput,
  isoToLocalTimeInput,
  formatLocalDateInput,
  localDateTimeToIso,
} from '@/Services/Scheduling/utils/time.utils';
import {
  MODAL_TITLE_CREATE,
  MODAL_TITLE_EDIT,
  LABEL_TITLE,
  LABEL_DESCRIPTION,
  LABEL_DATE,
  LABEL_START_TIME,
  LABEL_END_TIME,
  LABEL_ROOM,
  HELPER_TEXT_ROOM,
  LABEL_ATTENDEES,
  LABEL_ALL_ATTENDEES,
  LABEL_LOADING_ATTENDEES,
  LABEL_NO_ATTENDEES,
  BUTTON_CANCEL,
  BUTTON_SUBMIT_CREATE,
  BUTTON_SUBMIT_EDIT,
  ERROR_MISSING_TITLE,
  ERROR_MISSING_DATE,
  ERROR_MISSING_TIME,
  ERROR_INVALID_TIME_RANGE,
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
  ALL_ATTENDEES_SENTINEL,
} from './CreateEventModal.const';
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
  const { members, isLoading: membersLoading } = useSchoolMembers();
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
  const [room, setRoom] = useState(event?.room ?? '');
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[] | null>(
    event ? event.attendees.map((a) => a.userPublicId) : null,
  );
  const [error, setError] = useState<string | null>(null);

  const allIds = members.map((m) => m.userPublicId);
  const attendeeIds = selectedAttendeeIds ?? allIds;
  const allSelected = allIds.length > 0 && allIds.every((id) => attendeeIds.includes(id));

  const memberName = (id: string) =>
    members.find((m) => m.userPublicId === id)?.displayName ??
    event?.attendees.find((a) => a.userPublicId === id)?.displayName ??
    id;

  const handleAttendeesChange = (value: string | string[]) => {
    const next = typeof value === 'string' ? value.split(',') : value;
    if (next.includes(ALL_ATTENDEES_SENTINEL)) {
      setSelectedAttendeeIds(allSelected ? [] : allIds);
      return;
    }
    setSelectedAttendeeIds(next);
  };

  const handleSubmit = () => {
    if (!title.trim()) return setError(ERROR_MISSING_TITLE);
    if (!date) return setError(ERROR_MISSING_DATE);
    if (!startTime || !endTime) return setError(ERROR_MISSING_TIME);

    const startUtc = localDateTimeToIso(date, startTime);
    const endUtc = localDateTimeToIso(date, endTime);

    if (!startUtc || !endUtc || new Date(startUtc) >= new Date(endUtc)) {
      return setError(ERROR_INVALID_TIME_RANGE);
    }
    setError(null);

    const input = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      startUtc,
      endUtc,
      room: room.trim() ? room.trim() : undefined,
      attendeeUserPublicIds: attendeeIds,
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
        <TextField
          label={LABEL_ROOM}
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          helperText={HELPER_TEXT_ROOM}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="attendees-label">{LABEL_ATTENDEES}</InputLabel>
          <Select
            labelId="attendees-label"
            multiple
            value={attendeeIds}
            onChange={(e) => handleAttendeesChange(e.target.value)}
            input={<OutlinedInput label={LABEL_ATTENDEES} />}
            renderValue={(selected) =>
              allSelected ? (
                <Box sx={styles.chips}>
                  <Chip label={LABEL_ALL_ATTENDEES} size="small" color="primary" />
                </Box>
              ) : (
                <Box sx={styles.chips}>
                  {selected.map((id) => (
                    <Chip key={id} label={memberName(id)} size="small" />
                  ))}
                </Box>
              )
            }
          >
            {members.length === 0 && (
              <MenuItem disabled value="">
                {membersLoading ? LABEL_LOADING_ATTENDEES : LABEL_NO_ATTENDEES}
              </MenuItem>
            )}
            {members.length > 0 && (
              <MenuItem value={ALL_ATTENDEES_SENTINEL}>
                <Checkbox checked={allSelected} />
                <ListItemText primary={LABEL_ALL_ATTENDEES} />
              </MenuItem>
            )}
            {members.map((m) => (
              <MenuItem key={m.userPublicId} value={m.userPublicId}>
                <Checkbox checked={attendeeIds.includes(m.userPublicId)} />
                <ListItemText primary={m.displayName} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        <Box sx={styles.actions}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            {BUTTON_CANCEL}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
            {isEdit ? BUTTON_SUBMIT_EDIT : BUTTON_SUBMIT_CREATE}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
