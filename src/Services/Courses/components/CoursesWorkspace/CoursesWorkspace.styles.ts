import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  page: { display: 'flex', flexDirection: 'column', gap: 3 },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 },
  titleGroup: { display: 'flex', flexDirection: 'column', gap: 1 },
  actions: { display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' },
  primaryButton: { textTransform: 'none', borderRadius: 2, boxShadow: 'none', fontWeight: 700 },
  button: { textTransform: 'none', borderRadius: 2 },
  search: { width: { xs: '100%', sm: 360 }, backgroundColor: 'var(--admin-surface)' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' },
  muted: { color: 'var(--admin-muted)' },
};
