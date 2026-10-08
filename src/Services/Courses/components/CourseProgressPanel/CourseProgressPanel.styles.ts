import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  panel: { display: 'flex', flexDirection: 'column', gap: 2 },
  title: { fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', listStyle: 'none', m: 0, p: 0, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', backgroundColor: 'background.paper' },
  row: { display: 'flex', flexDirection: 'column', gap: 1.5, p: 2.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } },
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 },
  name: { fontWeight: 600, overflowWrap: 'anywhere' },
  percentage: { fontWeight: 700, color: 'primary.main', flexShrink: 0 },
  bar: { height: 8, borderRadius: 4 },
  summary: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' },
  muted: { color: 'text.secondary' },
};
