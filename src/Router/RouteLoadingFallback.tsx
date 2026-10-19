import { Box, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { routeLoadingSx } from './RouteLoadingFallback.styles';

export default function RouteLoadingFallback() {
  return (
    <Box role="status" aria-live="polite" sx={routeLoadingSx}>
      <ClipLoader color="var(--accent)" />
      <Typography color="text.secondary">Загрузка раздела…</Typography>
    </Box>
  );
}
