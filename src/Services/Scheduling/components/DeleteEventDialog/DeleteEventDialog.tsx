import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { DELETE_EVENT_TEXT as text } from './DeleteEventDialog.const';
import { styles } from './DeleteEventDialog.styles';

interface DeleteEventDialogProps {
  title: string;
  dateLabel: string;
  isPending: boolean;
  hasError: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteEventDialog({ title, dateLabel, isPending, hasError, onCancel, onConfirm }: DeleteEventDialogProps) {
  return <Dialog open onClose={isPending ? undefined : onCancel} aria-labelledby="delete-event-title">
    <DialogTitle id="delete-event-title">{text.title}</DialogTitle>
    <DialogContent>
      <Typography sx={styles.title}>{title}</Typography>
      <Typography variant="body2" sx={styles.date}>{dateLabel}</Typography>
      <DialogContentText>{text.description}</DialogContentText>
      {hasError && <Alert severity="error" sx={styles.error}>{text.error}</Alert>}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} disabled={isPending} autoFocus>{text.cancel}</Button>
      <Button onClick={onConfirm} disabled={isPending} color="error" variant="contained">{isPending ? text.pending : text.confirm}</Button>
    </DialogActions>
  </Dialog>;
}
