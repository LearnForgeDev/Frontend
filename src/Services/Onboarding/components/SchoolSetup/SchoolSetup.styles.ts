import type { SxProps, Theme } from '@mui/material';

export const scenarios: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  alignItems: 'start',
  gap: { xs: 2, sm: 3 },
};

export const card: SxProps<Theme> = {
  p: { xs: 3, sm: 4 },
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 5,
  minWidth: 0,
};

export const title: SxProps<Theme> = {
  fontWeight: 750,
  fontSize: '1.375rem',
};

export const error: SxProps<Theme> = {
  mb: 2,
};

export const cardHeader: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  mb: 2,
};
