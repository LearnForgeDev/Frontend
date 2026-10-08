import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  row: { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', alignItems: 'center', columnGap: 2, rowGap: 1, p: { xs: 2, sm: 2.5 }, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } },
  number: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: 2, backgroundColor: 'action.hover', color: 'text.secondary', fontWeight: 700 },
  name: { flex: '1 1 160px', minWidth: 0, fontWeight: 600, overflowWrap: 'anywhere' },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, gridColumn: '2', flexWrap: 'wrap' },
  button: { textTransform: 'none', borderRadius: 2, minHeight: 44 },
  completion: { mr: 0, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } },
};
