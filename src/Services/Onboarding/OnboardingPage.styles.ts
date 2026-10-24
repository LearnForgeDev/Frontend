import type { SxProps, Theme } from '@mui/material';

export const content: SxProps<Theme> = {
  width: '100%',
  maxWidth: 880,
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 3, sm: 4 },
};

export const header: SxProps<Theme> = {
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
};

export const title: SxProps<Theme> = {
  fontSize: { xs: '1.875rem', sm: '2.25rem' },
  fontWeight: 800,
  color: 'text.primary',
};

export const subtitle: SxProps<Theme> = {
  color: 'text.secondary',
  fontSize: '1rem',
};
