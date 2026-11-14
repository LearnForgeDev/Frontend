import type { SessionRestoreErrorProps } from './SessionRestoreError.type';
import { Button, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { SESSION_RESTORE_ERROR } from '../../hooks/useRestoreSession/useRestoreSession.const';
import { ErrorContainer } from './SessionRestoreError.styles';

export default function SessionRestoreError({ onRetry, onLogout, isPending }: SessionRestoreErrorProps) {
  return (
    <ErrorContainer role={isPending ? 'status' : 'alert'}>
      {isPending && <ClipLoader color="var(--accent)" />}
      <Typography>{isPending ? 'Проверяем вход…' : SESSION_RESTORE_ERROR}</Typography>
      {!isPending && <Button variant="contained" onClick={onRetry}>Повторить</Button>}
      <Button data-testid="session-restore-login" onClick={onLogout}>Войти в другой аккаунт</Button>
    </ErrorContainer>
  );
}
