import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  card: { height: '100%', display: 'flex', borderRadius: 3, borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)', boxShadow: 'none' },
  action: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', p: 3, gap: 2, height: '100%', minHeight: 250 },
  icon: { color: 'var(--admin-primary)', fontSize: 32 },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 },
  arrow: { color: 'var(--admin-muted)', fontSize: 20 },
  title: { color: 'var(--admin-text)', fontWeight: 700, overflowWrap: 'anywhere' },
  description: { color: 'var(--admin-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' },
  meta: { display: 'flex', gap: 2, flexWrap: 'wrap', mt: 'auto', color: 'var(--admin-muted)' },
  metaItem: { display: 'flex', alignItems: 'center', gap: 0.75 },
  progress: { display: 'flex', flexDirection: 'column', gap: 1 },
  progressBar: { height: 6, borderRadius: 3 },
};
