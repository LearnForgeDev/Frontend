import { Button, Typography } from '@mui/material';
import { SESSION_RESTORE_ERROR } from '../../hooks/useRestoreSession/useRestoreSession.const';
import { ErrorContainer } from './SessionRestoreError.styles';

type SessionRestoreErrorProps = {
  onRetry: () => void;
};

export default function SessionRestoreError({ onRetry }: SessionRestoreErrorProps) {
  return (
    <ErrorContainer role="alert">
      <Typography>{SESSION_RESTORE_ERROR}</Typography>
      <Button variant="contained" onClick={onRetry}>Повторить</Button>
    </ErrorContainer>
  );
}
