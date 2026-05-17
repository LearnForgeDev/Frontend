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

export const cardSx: SxProps<Theme> = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

export const cardHeaderSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  flexWrap: 'wrap',
};

export const fileListSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

export const fileRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.75rem 1rem',
  borderRadius: '1rem',
  border: '1px solid var(--admin-border)',
  background: 'var(--admin-surface)',
};

export const fileMetaSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

export const fileActionsSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

export const uploadFormSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

export const uploadRowSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
};

export const uploadInputSx: SxProps<Theme> = {
  flex: '1 1 220px',
  minWidth: 220,
};

export const uploadActionsSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  flexWrap: 'wrap',
};

export const helperTextSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  fontSize: '0.85rem',
};

export const progressRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

export const fileNameSx: SxProps<Theme> = {
  fontWeight: 700,
};

export const statusChipSx: SxProps<Theme> = {
  textTransform: 'uppercase',
  fontSize: '0.65rem',
  fontWeight: 800,
};
