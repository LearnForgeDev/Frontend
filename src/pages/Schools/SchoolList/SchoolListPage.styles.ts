import type { SxProps, Theme } from '@mui/material/styles';

export const pageSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

export const headerRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  flexWrap: 'wrap',
};

export const formCardSx: SxProps<Theme> = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

export const formRowSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
};

export const inputSx: SxProps<Theme> = {
  flex: '1 1 220px',
  minWidth: 220,
};

export const hintSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  fontSize: '0.85rem',
};

export const listCardSx: SxProps<Theme> = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};
