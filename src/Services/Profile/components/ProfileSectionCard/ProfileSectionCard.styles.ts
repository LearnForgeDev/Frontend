import type { SxProps, Theme } from '@mui/material';

export const cardSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  p: { xs: 1.25, sm: 2.5 },
  borderRadius: 3,
  border: '1px solid var(--admin-border)',
  bgcolor: 'var(--admin-surface)',
  boxShadow: 'var(--admin-shadow)',
};

export const bodySx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
};

export const listSx: SxProps<Theme> = {
  m: 0,
  p: 0,
  listStyle: 'none',
};

export const loadingSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  py: 1.5,
};
