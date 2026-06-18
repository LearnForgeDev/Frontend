import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { authEndpoints } from '../../../../Endpoints/auth.endpoints';

interface InviteTokenWidgetProps {
  schoolPublicId: string;
}

export const InviteTokenWidget: React.FC<InviteTokenWidgetProps> = ({ schoolPublicId }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        const res = await authEndpoints.invite({
          schoolPublicId,
          role: "1",
          maxUses: 100,
          expiresInMinutes: 10080, // 7 days
        });
        
        if (typeof res === 'string') {
          setToken(res);
        } else if (res && typeof res === 'object' && 'inviteToken' in res) {
          setToken((res as any).inviteToken);
        } else if (res && typeof res === 'object' && 'token' in res) {
          setToken((res as any).token);
        } else {
          setToken(JSON.stringify(res));
        }
      } catch (err: any) {
        setError(err.message || "Failed to create token");
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [schoolPublicId]);

  const handleCopy = () => {
    if (token) {
      navigator.clipboard.writeText(token);
    }
  };

  return (
    <Paper className="admin-card" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Typography component="h3" sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
        Invite Token (Student)
      </Typography>
      
      {loading && <CircularProgress size={24} />}
      
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && token && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.default', p: 1.5, borderRadius: 2 }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: 2, fontWeight: 600, color: 'primary.main', flexGrow: 1 }}>
            {token}
          </Typography>
          <IconButton onClick={handleCopy} color="primary" size="small">
            <ContentCopyIcon />
          </IconButton>
        </Box>
      )}
    </Paper>
  );
};
