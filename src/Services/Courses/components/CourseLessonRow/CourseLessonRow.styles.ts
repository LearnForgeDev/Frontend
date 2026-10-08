import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  row: { display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', p: { xs: 2, sm: 2.5 }, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } },
  number: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: 2, backgroundColor: 'action.hover', color: 'text.secondary', fontWeight: 700 },
  name: { flex: '1 1 160px', minWidth: 0, fontWeight: 600, overflowWrap: 'anywhere' },
  actions: { display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexWrap: 'wrap' },
  button: { textTransform: 'none', borderRadius: 2 },
  completion: { mr: 0, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } },
};
