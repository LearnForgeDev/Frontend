import type { SxProps, Theme } from '@mui/material';

export const widgetCardSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
};

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 1,
};

export const widgetTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  fontFamily: 'Manrope, sans-serif',
  color: 'var(--admin-text)',
  fontSize: '1.05rem',
};

export const lessonNameSx: SxProps<Theme> = {
  fontWeight: 700,
  color: 'var(--admin-text)',
};

export const detailsSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  mb: 1,
};

export const actionSx: SxProps<Theme> = {
  alignSelf: 'flex-start',
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 700,
};
