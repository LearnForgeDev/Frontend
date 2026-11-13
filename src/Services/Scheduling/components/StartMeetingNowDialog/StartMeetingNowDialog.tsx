import type { StartMeetingNowDialogProps } from './StartMeetingNowDialog.type';
export type { StartMeetingNowDialogProps } from './StartMeetingNowDialog.type';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { formatEventFullDateTime } from '@/Services/Scheduling/utils/time.utils';

import { CANCEL_BUTTON_TEXT, CONFIRM_BUTTON_TEXT, DIALOG_DESCRIPTION, DIALOG_TITLE, NEW_INTERVAL_LABEL } from './StartMeetingNowDialog.const';

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
        <Button data-testid="schedule-start-now-cancel" onClick={onCancel} disabled={isPending}>
          {CANCEL_BUTTON_TEXT}
        </Button>
        <Button data-testid="schedule-start-now-confirm" variant="contained" onClick={onConfirm} disabled={isPending}>
          {CONFIRM_BUTTON_TEXT}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
