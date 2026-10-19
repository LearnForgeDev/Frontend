import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  card: { height: '100%', display: 'flex', borderRadius: 3, borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)', boxShadow: 'none', transition: 'border-color 150ms ease, box-shadow 150ms ease', '&:hover': { borderColor: 'var(--admin-primary)' }, '&:focus-within': { outline: '2px solid var(--admin-primary)', outlineOffset: 3 } },
  action: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', p: { xs: 2.5, md: 3 }, gap: 2, height: '100%', minHeight: 224 },
  icon: { color: 'var(--admin-primary)', fontSize: 32 },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 },
  title: { color: 'var(--admin-text)', fontWeight: 700, overflowWrap: 'anywhere' },
  description: { color: 'var(--admin-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' },
  meta: { display: 'flex', gap: 2, flexWrap: 'wrap', mt: 'auto', color: 'var(--admin-muted)' },
  metaItem: { display: 'flex', alignItems: 'center', gap: 0.75 },
  progress: { display: 'flex', flexDirection: 'column', gap: 1 },
  progressBar: { height: 6, borderRadius: 3 },
};
