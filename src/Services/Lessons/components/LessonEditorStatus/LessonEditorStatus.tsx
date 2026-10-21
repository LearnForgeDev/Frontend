import { Alert, Box, Button } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { statusSx } from './LessonEditorStatus.styles';

interface LessonEditorStatusProps {
  isLoading: boolean;
  isError: boolean;
  isRetrying: boolean;
  retry: () => unknown;
}

export default function LessonEditorStatus({ isLoading, isError, isRetrying, retry }: LessonEditorStatusProps) {
  if (isLoading) return <Box sx={statusSx} role="status"><ClipLoader color="var(--app-primary)" />Загрузка урока…</Box>;
  return <Alert severity={isError ? 'error' : 'info'} action={isError ? <Button color="inherit" disabled={isRetrying} onClick={() => void retry()}>Повторить</Button> : undefined}>
    {isError ? 'Не удалось открыть урок. Проверьте доступ или попробуйте ещё раз.' : 'Содержимое урока пока недоступно.'}
  </Alert>;
}
