import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  form: { display: 'flex', flexDirection: 'column', gap: 3, pt: 2, width: { xs: '100%', sm: 480 }, maxWidth: '100%' },
  actions: { display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1 },
  button: { textTransform: 'none', borderRadius: 2 },
  error: { color: 'error.main' },
};
