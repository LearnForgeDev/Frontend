import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  root: { backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, px: 3, py: 7 },
  icon: { fontSize: 42, color: 'var(--admin-muted)' },
  title: { fontWeight: 700, color: 'var(--admin-text)' },
  description: { color: 'var(--admin-muted)', maxWidth: 420 },
  button: { textTransform: 'none', borderRadius: 2 },
};
