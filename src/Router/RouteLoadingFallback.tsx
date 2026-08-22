import { Box, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';

export default function RouteLoadingFallback() {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 3,
      }}
    >
      <ClipLoader color="var(--app-primary)" size={32} />
      <Typography color="text.secondary">Загрузка раздела…</Typography>
    </Box>
  );
}
