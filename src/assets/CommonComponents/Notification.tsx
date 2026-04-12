import type { NotificationProps } from '../../types/commonTypes.ts';
import { Alert, AlertTitle, Slide, Snackbar, type SnackbarCloseReason } from '@mui/material';
import type { ComponentProps, SyntheticEvent } from 'react';

type NotificationWithClose = NotificationProps & {
  onClose?: () => void;
};

const UpSlide = (props: ComponentProps<typeof Slide>) => <Slide {...props} direction="up" />;

export default function Notification({
  title,
  message,
  success,
  durationMS,
  onClose,
}: NotificationWithClose) {
  const notificationTitle =
    title !== undefined && title !== ''
      ? title
      : success !== undefined
        ? success
          ? 'Успешно'
          : 'Ошибка'
        : 'Уведомление';

  const handleClose = (_event?: Event | SyntheticEvent, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose?.();
  };

  return (
    <Snackbar
      open
      onClose={handleClose}
      autoHideDuration={durationMS}
      slots={{ transition: UpSlide }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiAlert-root': {
          minWidth: 260,
          maxWidth: 420,
        },
      }}
    >
      <Alert severity={success === undefined ? 'info' : success ? 'success' : 'error'} variant="filled" onClose={onClose ? handleClose : undefined}>
        <AlertTitle>{notificationTitle}</AlertTitle>
        {message ?? ''}
      </Alert>
    </Snackbar>
  );
}