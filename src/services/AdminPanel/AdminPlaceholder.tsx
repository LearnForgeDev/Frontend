import type { JSX } from 'react';
import { Box, Typography } from '@mui/material';

export default function AdminPlaceholder(): JSX.Element {
  return (
    <Box className="admin-empty-state">
      <Typography variant="h6" component="h3" className="admin-widget-title">Выберите сервис</Typography>
      <Typography>Выберите сервис на боковой панели, чтобы настроить доступ, лимиты и параметры интеграции.</Typography>
    </Box>
  );
}
