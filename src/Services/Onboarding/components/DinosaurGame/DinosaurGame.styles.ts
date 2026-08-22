import type { SxProps, Theme } from '@mui/material';

export const container: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  p: 2,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 4,
  bgcolor: 'background.paper',
};

export const header: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
};

export const score: SxProps<Theme> = {
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 700,
};

export const title: SxProps<Theme> = {
  fontWeight: 700,
};

export const canvas: SxProps<Theme> = {
  display: 'block',
  width: '100%',
  height: 'auto',
  borderRadius: 3,
  cursor: 'pointer',
  touchAction: 'manipulation',
  outline: 'none',
  '&:focus-visible': {
    boxShadow: '0 0 0 3px rgba(49, 95, 84, 0.28)',
  },
};

export const hint: SxProps<Theme> = {
  color: 'text.secondary',
};
