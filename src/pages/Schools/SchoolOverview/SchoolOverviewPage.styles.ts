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

export const cardGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem',
};

export const infoCardSx: SxProps<Theme> = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
};

export const helperTextSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
};
