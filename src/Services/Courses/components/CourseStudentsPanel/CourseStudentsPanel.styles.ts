import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  panel: { display: 'flex', flexDirection: 'column', gap: 2 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 },
  title: { fontWeight: 700 },
  button: { textTransform: 'none' },
  list: { display: 'flex', flexDirection: 'column', listStyle: 'none', m: 0, p: 0, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', backgroundColor: 'background.paper' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, p: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } },
  identity: { display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 },
  icon: { color: 'text.secondary' },
  name: { overflowWrap: 'anywhere' },
};
