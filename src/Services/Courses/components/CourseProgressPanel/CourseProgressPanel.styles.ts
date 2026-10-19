import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  panel: { display: 'flex', flexDirection: 'column', gap: 2 },
  title: { fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', listStyle: 'none', m: 0, p: 0, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', backgroundColor: 'background.paper' },
  row: { display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(160px, 1fr) minmax(120px, 1fr) minmax(100px, auto)' }, alignItems: 'center', gap: { xs: 1.25, md: 3 }, px: { xs: 2, md: 3 }, py: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } },
  name: { fontWeight: 600, overflowWrap: 'anywhere' },
  percentage: { fontWeight: 700, color: 'primary.main', flexShrink: 0 },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'action.hover' },
  summary: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' },
  muted: { color: 'text.secondary' },
};
