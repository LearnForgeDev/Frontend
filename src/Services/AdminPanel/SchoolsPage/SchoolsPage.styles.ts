import type { SxProps, Theme } from '@mui/material/styles';

export const pageSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: { xs: 'stretch', sm: 'flex-end' },
  justifyContent: 'space-between',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
};

export const titleSx: SxProps<Theme> = {
  fontFamily: 'Manrope, sans-serif',
  fontSize: { xs: '1.75rem', md: '2.25rem' },
  fontWeight: 800,
  letterSpacing: '-0.035em',
  color: 'var(--app-text)',
};

export const descriptionSx: SxProps<Theme> = { mt: 0.75, color: 'var(--app-text-muted)' };
