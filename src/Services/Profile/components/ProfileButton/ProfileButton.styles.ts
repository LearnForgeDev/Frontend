import type { SxProps, Theme } from '@mui/material';

export const avatarSx: SxProps<Theme> = {
  width: 34,
  height: 34,
  bgcolor: 'var(--app-primary-soft)',
  color: 'var(--app-primary-strong)',
  fontSize: '0.78rem',
  fontWeight: 800,
};

export const profileNameSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: '0.86rem',
};

export const profileHintSx: SxProps<Theme> = {
  color: 'var(--app-text-subtle)',
  fontSize: '0.72rem',
};

export const profileButtonSx: SxProps<Theme> = {
  flexShrink: 0,
  minWidth: 40,
  minHeight: 44,
  gap: 1,
  px: 1,
  width: '100%',
  justifyContent: 'flex-start',
  borderRadius: '12px',
  color: 'var(--app-text-muted)',
  textTransform: 'none',
};

export const profileTextSx: SxProps<Theme> = {
  display: 'block',
  minWidth: 0,
  maxWidth: 180,
  textAlign: 'left',
};

export const compactProfileButtonSx: SxProps<Theme> = { ...profileButtonSx, width: 44, p: 0, justifyContent: 'center' };
