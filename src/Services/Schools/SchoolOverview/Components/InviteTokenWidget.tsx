import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { authEndpoints } from '@/Endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import { useParams } from 'react-router-dom';
import { AuthRole } from '@/Assets/Types/commonTypes.ts';

interface InviteTokenWidgetProps {
  schoolPublicId: string;
}

export const InviteTokenWidget: React.FC<InviteTokenWidgetProps> = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { schoolPublicId } = useParams();
  const userRole = useGlobalContext().auth.user?.roles.find((r) => String(r?.schoolId) === schoolPublicId)?.role;

  if (!schoolPublicId) {
    throw new Error('No active school public id');
  }

  const fetchToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authEndpoints.invite({
        schoolPublicId,
        role: AuthRole.STUDENT,
      });

      if (typeof res === 'string') {
        setToken(res);
      } else if (res && typeof res === 'object' && 'inviteToken' in res) {
        setToken((res as Record<string, unknown>).inviteToken as string);
      } else if (res && typeof res === 'object' && 'token' in res) {
        setToken((res as Record<string, unknown>).token as string);
      } else {
        setToken(JSON.stringify(res));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Не удалось создать токен");
    } finally {
      setLoading(false);
    }
  }, [schoolPublicId]);

  useEffect(() => {
    if (userRole === AuthRole.STUDENT) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchToken();
  }, [fetchToken, userRole]);

  const handleCopy = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (userRole === 0) return null;

  return (
    <Paper className="admin-card" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="h3" sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
          Токен-приглашение (Ученик)
        </Typography>
        <Tooltip title="Сгенерировать заново">
          <IconButton onClick={fetchToken} disabled={loading} size="small" color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && <CircularProgress size={24} />}

      {error && (
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={fetchToken}>
            <RefreshIcon />
          </IconButton>
        }>
          {error}
        </Alert>
      )}

      {!loading && !error && token && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.default', p: 1.5, borderRadius: 2 }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: 2, fontWeight: 600, color: 'primary.main', flexGrow: 1, overflowX: 'scroll' }}>
            {token}
          </Typography>
          <Tooltip title={copied ? "Скопировано!" : "Скопировать токен"} placement="top">
            <IconButton onClick={handleCopy} color={copied ? "success" : "primary"} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
};
