import type { SxProps, Theme } from '@mui/material/styles';

export const gridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
  gap: 2,
};

export const skeletonSx: SxProps<Theme> = { borderRadius: '22px' };

export const cardSx = (isActive: boolean): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: '48px minmax(0, 1fr)',
  gap: 1.5,
  alignItems: 'center',
  p: 2.5,
  minHeight: 190,
  border: isActive ? '1px solid var(--app-primary)' : '1px solid var(--app-border)',
  borderRadius: '22px',
  backgroundColor: 'var(--app-surface)',
  boxShadow: isActive ? '0 0 0 4px var(--app-primary-soft)' : 'var(--app-shadow-sm)',
  transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: 'var(--app-shadow-md)',
  },
});

export const cardIconSx: SxProps<Theme> = {
  width: 48,
  height: 48,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '16px',
  color: 'var(--app-primary-strong)',
  backgroundColor: 'var(--app-primary-soft)',
};

export const cardTitleSx: SxProps<Theme> = {
  fontSize: '1.05rem',
  fontWeight: 800,
  color: 'var(--app-text)',
};

export const cardRoleSx: SxProps<Theme> = {
  mt: 0.4,
  color: 'var(--app-text-muted)',
  fontSize: '0.82rem',
};

export const openButtonSx: SxProps<Theme> = {
  gridColumn: '1 / -1',
  mt: 'auto',
};

export const emptySx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  px: 3,
  py: 7,
  border: '1px dashed var(--app-border-strong)',
  borderRadius: '24px',
  backgroundColor: 'var(--app-surface)',
};

export const emptyIconSx: SxProps<Theme> = {
  width: 56,
  height: 56,
  display: 'grid',
  placeItems: 'center',
  mb: 2,
  borderRadius: '18px',
  color: 'var(--app-primary-strong)',
  backgroundColor: 'var(--app-primary-soft)',
};

export const emptyTitleSx: SxProps<Theme> = { fontSize: '1.15rem', fontWeight: 800 };

export const emptyTextSx: SxProps<Theme> = {
  mt: 0.75,
  maxWidth: 440,
  color: 'var(--app-text-muted)',
};
