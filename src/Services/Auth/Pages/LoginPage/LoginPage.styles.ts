import type { SxProps, Theme } from '@mui/material/styles';

export const headingSx: SxProps<Theme> = { mb: 1 };

export const title: SxProps<Theme> = {
  fontFamily: 'Manrope, sans-serif',
  fontSize: { xs: '1.65rem', sm: '2rem' },
  fontWeight: 800,
  letterSpacing: '-0.035em',
  color: 'var(--app-text)',
};

export const subtitle: SxProps<Theme> = { mt: 0.75, color: 'var(--app-text-muted)' };

export const linkText: SxProps<Theme> = {
  mt: 1,
  color: 'var(--app-text-muted)',
  '& a': { fontWeight: 750 },
};
