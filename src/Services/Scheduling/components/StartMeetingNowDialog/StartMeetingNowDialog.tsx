import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { formatEventFullDateTime } from '@/Services/Scheduling/utils/time.utils';
import type { MeetingInterval } from '@/Services/Scheduling/utils/meeting.utils';
import {
  CANCEL_BUTTON_TEXT,
  CONFIRM_BUTTON_TEXT,
  DIALOG_DESCRIPTION,
  DIALOG_TITLE,
  NEW_INTERVAL_LABEL,
} from './StartMeetingNowDialog.const';

export interface StartMeetingNowDialogProps {
  interval: MeetingInterval | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function StartMeetingNowDialog({
  interval,
  isPending,
  onCancel,
  onConfirm,
}: StartMeetingNowDialogProps) {
  return (
    <Dialog open={Boolean(interval)} onClose={isPending ? undefined : onCancel}>
      <DialogTitle>{DIALOG_TITLE}</DialogTitle>
      <DialogContent>
        <DialogContentText>{DIALOG_DESCRIPTION}</DialogContentText>
        {interval && (
          <Typography variant="body2">
            {NEW_INTERVAL_LABEL}: {formatEventFullDateTime(interval.startUtc, interval.endUtc)}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isPending}>
          {CANCEL_BUTTON_TEXT}
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={isPending}>
          {CONFIRM_BUTTON_TEXT}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
