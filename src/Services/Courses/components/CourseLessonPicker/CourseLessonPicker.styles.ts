import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  root: { display: 'flex', flexDirection: 'column', gap: 1.5 },
  title: { fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', gap: 1, listStyle: 'none', m: 0, p: 0 },
  row: { display: 'grid', gridTemplateColumns: { xs: 'auto minmax(0, 1fr)', sm: 'auto minmax(0, 1fr) auto' }, alignItems: 'center', gap: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 },
  number: { color: 'text.secondary', minWidth: 24, textAlign: 'center' },
  name: { flex: 1, minWidth: 0, overflowWrap: 'anywhere' },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gridColumn: { xs: '2', sm: 'auto' }, '& .MuiIconButton-root': { minWidth: 44, minHeight: 44 } },
  hint: { color: 'text.secondary' },
};
