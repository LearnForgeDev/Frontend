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

export const topbarProfileButtonSx: SxProps<Theme> = {
  minWidth: 40,
  minHeight: 44,
  gap: 1,
  px: { xs: 0.5, sm: 1 },
  borderRadius: '12px',
  color: 'var(--app-text-muted)',
  textTransform: 'none',
};

export const topbarProfileTextSx: SxProps<Theme> = {
  display: { xs: 'none', sm: 'block' },
  minWidth: 0,
  maxWidth: 180,
  textAlign: 'left',
};
