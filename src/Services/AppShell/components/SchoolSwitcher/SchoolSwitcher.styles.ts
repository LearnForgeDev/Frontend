import type { SxProps, Theme } from '@mui/material/styles';

export const switcherSx: SxProps<Theme> = {
  width: '100%',
  minHeight: 58,
  justifyContent: 'space-between',
  border: '1px solid var(--app-border)',
  borderRadius: '16px',
  backgroundColor: 'var(--app-surface-subtle)',
  color: 'var(--app-text)',
  px: 1.5,
  textTransform: 'none',
  '&:hover': {
    borderColor: 'var(--app-border-strong)',
    backgroundColor: 'var(--app-surface-muted)',
  },
};

export const compactSwitcherSx: SxProps<Theme> = {
  ...switcherSx,
  width: 'auto',
  minHeight: 40,
  px: 1.25,
};

export const iconSwitcherSx: SxProps<Theme> = {
  ...switcherSx,
  width: '100%',
  minWidth: 0,
  minHeight: 44,
  justifyContent: 'center',
  px: 0,
};

export const titleRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.1,
  minWidth: 0,
};

export const textSx: SxProps<Theme> = { minWidth: 0, textAlign: 'left' };

export const titleSx: SxProps<Theme> = { fontWeight: 800, fontSize: '0.9rem' };

export const compactTitleSx: SxProps<Theme> = { ...titleSx, fontSize: '0.82rem' };

export const subtitleSx: SxProps<Theme> = { color: 'var(--app-text-subtle)', fontSize: '0.72rem' };

export const menuPaperSx: SxProps<Theme> = { minWidth: 248, mt: 1, borderRadius: '16px' };
