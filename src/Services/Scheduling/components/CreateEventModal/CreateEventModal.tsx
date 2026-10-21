import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { Modal } from '@/Assets/Components/Modal/Modal';
import { useEventEditor } from '../../hooks/useEventEditor/useEventEditor';
import type { EventEditorOptions } from '../../hooks/useEventEditor/useEventEditor.types';
import { EventAttendeePicker } from '../EventAttendeePicker/EventAttendeePicker';
import {
  MODAL_TITLE_CREATE, MODAL_TITLE_EDIT, LABEL_TITLE, LABEL_DESCRIPTION, LABEL_DATE,
  LABEL_START_TIME, LABEL_END_TIME, BUTTON_CANCEL, BUTTON_SUBMIT_CREATE, BUTTON_SUBMIT_EDIT,
  STUDENTS_LOADING_TEXT, STUDENTS_ERROR_TEXT, STUDENTS_RETRY_TEXT, SAVING_TEXT, STUDENTS_LOADER_SIZE,
} from './CreateEventModal.const';
import { styles } from './CreateEventModal.styles';

export type CreateEventModalProps = EventEditorOptions;

export function CreateEventModal(props: CreateEventModalProps) {
  const editor = useEventEditor(props);
  return (
    <Modal title={editor.isEdit ? MODAL_TITLE_EDIT : MODAL_TITLE_CREATE} onClose={props.onClose} disableClose={editor.isSaving}>
      <Box component="form" sx={styles.form} onSubmit={event => { event.preventDefault(); editor.submit(); }} noValidate>
        <TextField label={LABEL_TITLE} value={editor.form.title} onChange={event => editor.setField('title', event.target.value)} required fullWidth disabled={editor.isSaving} autoFocus />
        <TextField label={LABEL_DESCRIPTION} value={editor.form.description} onChange={event => editor.setField('description', event.target.value)} multiline minRows={2} fullWidth disabled={editor.isSaving} />
        <TextField label={LABEL_DATE} type="date" value={editor.form.date} onChange={event => editor.setField('date', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required fullWidth disabled={editor.isSaving} />
        <Box sx={styles.row}>
          <TextField label={LABEL_START_TIME} type="time" value={editor.form.startTime} onChange={event => editor.setField('startTime', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required fullWidth disabled={editor.isSaving} />
          <TextField label={LABEL_END_TIME} type="time" value={editor.form.endTime} onChange={event => editor.setField('endTime', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required fullWidth disabled={editor.isSaving} />
        </Box>
        {editor.studentsLoading && <Box sx={styles.studentsStatus} role="status"><ClipLoader size={STUDENTS_LOADER_SIZE} /><Typography variant="body2" color="text.secondary">{STUDENTS_LOADING_TEXT}</Typography></Box>}
        {editor.studentsError && <Alert severity="error" action={<Button onClick={editor.retryStudents}>{STUDENTS_RETRY_TEXT}</Button>}>{STUDENTS_ERROR_TEXT}</Alert>}
        <EventAttendeePicker options={editor.attendeeOptions} selected={editor.selectedAttendees}
          disabled={editor.isSaving || editor.isAudienceUnavailable} hasStudents={editor.hasStudents}
          withoutAttendees={editor.form.withoutAttendees} onChange={editor.setAttendees}
          onSelectAll={editor.selectAllStudents} onWithoutAttendeesChange={editor.setWithoutAttendees} />
        {editor.form.error && <Typography color="error" variant="body2" role="alert">{editor.form.error}</Typography>}
        <Box sx={styles.actions}>
          <Button onClick={props.onClose} disabled={editor.isSaving}>{BUTTON_CANCEL}</Button>
          <Button type="submit" variant="contained" disabled={editor.isSaving || editor.isAudienceUnavailable}>{editor.isSaving ? SAVING_TEXT : editor.isEdit ? BUTTON_SUBMIT_EDIT : BUTTON_SUBMIT_CREATE}</Button>
        </Box>
      </Box>
    </Modal>
  );
}
