import type { SxProps, Theme } from '@mui/material/styles';

export const loadingSx: SxProps<Theme> = {
  minHeight: 220,
  display: 'grid',
  placeItems: 'center',
};

export const cardSx: SxProps<Theme> = {
  overflow: 'hidden',
  border: '1px solid var(--app-border)',
  borderRadius: '22px',
  backgroundColor: 'var(--app-surface)',
  boxShadow: 'var(--app-shadow-sm)',
};

export const studentCellSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.25,
};

export const studentNameSx: SxProps<Theme> = {
  fontWeight: 750,
};

export const avatarSx: SxProps<Theme> = {
  width: 38,
  height: 38,
  bgcolor: 'var(--app-primary-soft)',
  color: 'var(--app-primary-strong)',
  fontSize: '0.78rem',
  fontWeight: 800,
};

export const emptySx: SxProps<Theme> = {
  p: 5,
  textAlign: 'center',
  border: '1px dashed var(--app-border-strong)',
  borderRadius: '22px',
  color: 'var(--app-text-muted)',
};
