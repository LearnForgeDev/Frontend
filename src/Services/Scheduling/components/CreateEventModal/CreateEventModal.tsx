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
import { styles } from './CreateEventModal.styles';

export interface CreateEventModalProps {
  onClose: () => void;
  /** When provided, the modal edits this event instead of creating a new one. */
  event?: ScheduleEvent | null;
}

/** ISO (UTC) → `datetime-local` value (local time). */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `datetime-local` value → ISO string (treated as local time). */
function toIso(local: string): string {
  return new Date(local).toISOString();
}

export function CreateEventModal({ onClose, event = null }: CreateEventModalProps) {
  const isEdit = !!event;
  const { members, isLoading: membersLoading } = useSchoolMembers();
  const { createEvent, updateEvent } = useScheduleMutations();
  const mutation = isEdit ? updateEvent : createEvent;

  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [start, setStart] = useState(event ? toLocalInput(event.start) : '');
  const [end, setEnd] = useState(event ? toLocalInput(event.end) : '');
  const [room, setRoom] = useState(event?.room ?? '');
  const [attendeeIds, setAttendeeIds] = useState<string[]>(
    event ? event.attendees.map((a) => a.userPublicId) : [],
  );
  const [error, setError] = useState<string | null>(null);

  const allIds = members.map((m) => m.userPublicId);
  const allSelected = allIds.length > 0 && allIds.every((id) => attendeeIds.includes(id));

  const memberName = (id: string) =>
    members.find((m) => m.userPublicId === id)?.displayName
    ?? event?.attendees.find((a) => a.userPublicId === id)?.displayName
    ?? id;

  const handleAttendeesChange = (value: string | string[]) => {
    const next = typeof value === 'string' ? value.split(',') : value;
    // The "Все" sentinel toggles selecting every member.
    if (next.includes('__all__')) {
      setAttendeeIds(allSelected ? [] : allIds);
      return;
    }
    setAttendeeIds(next);
  };

  const handleSubmit = () => {
    if (!title.trim()) return setError('Укажите название.');
    if (!start || !end) return setError('Укажите начало и конец.');
    if (new Date(start) >= new Date(end)) return setError('Начало должно быть раньше конца.');
    setError(null);

    const input = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      startUtc: toIso(start),
      endUtc: toIso(end),
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
    <Modal title={isEdit ? 'Редактировать занятие' : 'Новое занятие'} onClose={onClose}>
      <Box sx={styles.form}>
        <TextField label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
        <TextField
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
        <Box sx={styles.row}>
          <TextField
            label="Начало"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Конец"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Box>
        <TextField
          label="Кабинет (необязательно)"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          helperText="Оставьте пустым — комната Jitsi будет создана автоматически."
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="attendees-label">Участники</InputLabel>
          <Select
            labelId="attendees-label"
            multiple
            value={attendeeIds}
            onChange={(e) => handleAttendeesChange(e.target.value)}
            input={<OutlinedInput label="Участники" />}
            renderValue={(selected) =>
              allSelected ? (
                <Box sx={styles.chips}>
                  <Chip label="Все участники школы" size="small" color="primary" />
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
                {membersLoading ? 'Загрузка участников…' : 'Участники не найдены'}
              </MenuItem>
            )}
            {members.length > 0 && (
              <MenuItem value="__all__">
                <Checkbox checked={allSelected} />
                <ListItemText primary="Все участники школы" />
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
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
