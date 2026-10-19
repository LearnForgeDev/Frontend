import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  form: { display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2, width: { xs: '100%', sm: 520 }, maxWidth: '100%' },
  actions: { display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1 },
  button: { textTransform: 'none', borderRadius: 2, minHeight: 44 },
  error: { color: 'error.main' },
};
