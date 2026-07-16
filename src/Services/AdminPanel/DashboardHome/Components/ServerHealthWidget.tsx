import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

import { checkHealthEndpoints } from '@/Endpoints';

export const ServerHealthWidget: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const isOnline = await checkHealthEndpoints.checkHealth();
        if (isMounted) {
          setStatus(isOnline ? 'online' : 'offline');
        }
      } catch (e) {
        if (isMounted) {
          setStatus('offline');
        }
        console.error(e);
      }
    };

    checkHealth();
    // Optional: poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Box
      sx={{
        border: "1px solid var(--admin-border)",
        borderRadius: "1.5rem",
        background: "var(--admin-surface)",
        boxShadow: "var(--admin-shadow)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        borderLeft:
          status === 'online'
            ? `4px solid var(--mui-palette-success-main, #2e7d32)`
            : status === 'offline'
              ? `4px solid var(--mui-palette-error-main, #d32f2f)`
              : `1px solid var(--admin-border)`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography
          component="h3"
          sx={{
            display: "flex",
            margin: 0,
            fontSize: "1rem",
            padding: 0,
            fontWeight: 700,
            alignItems: "center",
            color:
              status === 'online'
                ? "var(--mui-palette-success-main, #2e7d32)"
                : status === 'offline'
                  ? "var(--mui-palette-error-main, #d32f2f)"
                  : "var(--admin-muted)",
          }}
        >
          <Box
            component="span"
            className="material-symbols-outlined"
            sx={{ marginRight: "0.5rem", fontSize: "1.25rem" }}
          >
            {status === 'online' ? 'check_circle' : status === 'offline' ? 'error' : 'sync'}
          </Box>
          Состояние сервера
        </Typography>
        {status === 'loading' && <CircularProgress size={16} />}
      </Box>

      <Typography sx={{ margin: 0, color: "var(--admin-muted)", lineHeight: 1.5, fontSize: "0.875rem" }}>
        {status === 'online'
          ? "Сервер работает в штатном режиме. Все системы функционируют нормально."
          : status === 'offline'
            ? "Сервер недоступен. Проверьте подключение или обратитесь в поддержку."
            : "Проверка статуса сервера..."}
      </Typography>
    </Box>
  );
};
