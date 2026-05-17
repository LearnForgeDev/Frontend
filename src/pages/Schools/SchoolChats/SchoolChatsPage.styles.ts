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

export const gridCardSx: SxProps<Theme> = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  minHeight: 320,
};

export const cardHeaderSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  flexWrap: 'wrap',
};

export const helperTextSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  fontSize: '0.85rem',
};

export const statusRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
};

export const messageListSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  maxHeight: 360,
  overflowY: 'auto',
  paddingRight: '0.4rem',
};

export const messageItemSx: SxProps<Theme> = {
  padding: '0.75rem 1rem',
  borderRadius: '1rem',
  border: '1px solid var(--admin-border)',
  background: 'var(--admin-surface)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

export const messageMetaSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  fontSize: '0.8rem',
  color: 'var(--admin-muted)',
};

export const messageSenderSx: SxProps<Theme> = {
  fontWeight: 700,
  color: 'var(--admin-text)',
};

export const inputRowSx: SxProps<Theme> = {
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap',
  alignItems: 'center',
};

export const messageInputSx: SxProps<Theme> = {
  flex: '1 1 260px',
};

export const connectionFieldsSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
};

export const connectionRowSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

export const statusChipSx: SxProps<Theme> = {
  textTransform: 'uppercase',
  fontSize: '0.65rem',
  fontWeight: 800,
};
