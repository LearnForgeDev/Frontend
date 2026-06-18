import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Modal } from '@/Assets/Components/Modal/Modal';
import { useSchoolMembers } from '@/Services/Scheduling/hooks/useSchoolMembers/useSchoolMembers';
import { useScheduleMutations } from '@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations';
import { styles } from './CreateEventModal.styles';

export interface CreateEventModalProps {
  onClose: () => void;
}

/** ISO string from a `datetime-local` value (treated as local time). */
function toIso(local: string): string {
  return new Date(local).toISOString();
}

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const { members } = useSchoolMembers();
  const { createEvent } = useScheduleMutations();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [room, setRoom] = useState('');
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const memberName = (id: string) => members.find((m) => m.userPublicId === id)?.displayName ?? id;

  const handleSubmit = () => {
    if (!title.trim()) return setError('Title is required.');
    if (!start || !end) return setError('Start and end are required.');
    if (new Date(start) >= new Date(end)) return setError('Start must be before end.');
    setError(null);

    createEvent.mutate(
      {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        startUtc: toIso(start),
        endUtc: toIso(end),
        room: room.trim() ? room.trim() : undefined,
        attendeeUserPublicIds: attendeeIds,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal title="New session" onClose={onClose}>
      <Box sx={styles.form}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
        <Box sx={styles.row}>
          <TextField
            label="Start"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="End"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Box>
        <TextField
          label="Room (optional)"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          helperText="Leave blank to auto-allocate a Jitsi room."
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="attendees-label">Attendees</InputLabel>
          <Select
            labelId="attendees-label"
            multiple
            value={attendeeIds}
            onChange={(e) => setAttendeeIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            input={<OutlinedInput label="Attendees" />}
            renderValue={(selected) => (
              <Box sx={styles.chips}>
                {selected.map((id) => (
                  <Chip key={id} label={memberName(id)} size="small" />
                ))}
              </Box>
            )}
          >
            {members.map((m) => (
              <MenuItem key={m.userPublicId} value={m.userPublicId}>
                {m.displayName}
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
          <Button onClick={onClose} disabled={createEvent.isPending}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createEvent.isPending}>
            Create
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
