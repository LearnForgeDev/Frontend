import type { LessonEditorStatusProps } from './LessonEditorStatus.type';
import { Alert, Box, Button } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { statusSx } from './LessonEditorStatus.styles';

export default function LessonEditorStatus({ isLoading, isError, isRetrying, retry }: LessonEditorStatusProps) {
  if (isLoading) {
    return <Box sx={statusSx} role="status"><ClipLoader color="var(--app-primary)" />Загрузка статьи…</Box>;
  }
  return <Alert severity={isError ? 'error' : 'info'} action={isError ? <Button color="inherit" disabled={isRetrying} onClick={() => void retry()}>Повторить</Button> : undefined}>
    {isError ? 'Не удалось открыть статью. Проверьте доступ или попробуйте ещё раз.' : 'Содержимое статьи пока недоступно.'}
  </Alert>;
}
