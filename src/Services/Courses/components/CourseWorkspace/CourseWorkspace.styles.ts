import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  page: { display: 'flex', flexDirection: 'column', gap: 2.5 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 },
  titleGroup: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: '1 1 280px' },
  title: { fontSize: { xs: '1.6rem', md: '2rem' }, lineHeight: 1.2, fontWeight: 750, letterSpacing: '-0.025em', overflowWrap: 'anywhere' },
  description: { color: 'var(--admin-muted)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxWidth: 760 },
  actions: { display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' },
  button: { textTransform: 'none', borderRadius: 2, fontWeight: 700 },
  backButton: { alignSelf: 'flex-start', minHeight: 44, px: 0, textTransform: 'none', color: 'var(--admin-muted)' },
  meta: { display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' },
  tabs: { alignSelf: 'flex-start', maxWidth: '100%', overflowX: 'auto' },
  deleteContent: { display: 'flex', flexDirection: 'column', gap: 2, pt: 1 },
  error: { color: 'error.main' },
};
