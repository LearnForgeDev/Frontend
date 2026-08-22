import type { SxProps, Theme } from '@mui/material/styles';

export const cardSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: 760,
  p: { xs: 2, sm: 3 },
  border: '1px solid var(--app-border)',
  borderRadius: '22px',
  backgroundColor: 'var(--app-surface)',
  boxShadow: 'var(--app-shadow-sm)',
};

export const appBarSx: SxProps<Theme> = {
  borderBottom: '1px solid var(--app-border)',
  backgroundColor: 'var(--app-surface)',
};

export const toolbarSx: SxProps<Theme> = {
  gap: 1,
};

export const dialogTitleSx: SxProps<Theme> = {
  fontSize: '1.1rem',
  fontWeight: 800,
};

export const dialogContentSx: SxProps<Theme> = {
  minHeight: 'calc(100vh - 64px)',
  display: 'grid',
  placeItems: 'center',
  p: { xs: 2, sm: 4 },
  backgroundColor: 'var(--app-background)',
};

export const headerSx: SxProps<Theme> = { mb: 2.5 };
export const titleSx: SxProps<Theme> = { fontSize: '1.1rem', fontWeight: 800 };
export const subtitleSx: SxProps<Theme> = { mt: 0.5, color: 'var(--app-text-muted)', fontSize: '0.86rem' };

export const fieldsSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
  gap: 1.5,
  alignItems: 'start',
};

export const submitButtonSx: SxProps<Theme> = {
  gridColumn: { sm: '1 / -1' },
};

export const errorSx: SxProps<Theme> = { mt: 2 };

export const resultSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '160px minmax(0, 1fr)' },
  gap: 2.5,
  alignItems: 'center',
  mt: 3,
  p: 2,
  borderRadius: '18px',
  backgroundColor: 'var(--app-surface-subtle)',
};

export const qrSx: SxProps<Theme> = {
  width: 160,
  height: 160,
  display: 'grid',
  placeItems: 'center',
  p: 1.25,
  borderRadius: '14px',
  backgroundColor: '#ffffff',
};

export const tokenSx: SxProps<Theme> = {
  p: 1.5,
  border: '1px solid var(--app-border)',
  borderRadius: '12px',
  bgcolor: 'var(--app-surface)',
  fontFamily: 'monospace',
  fontSize: '0.82rem',
  wordBreak: 'break-all',
};

export const resultTitleSx: SxProps<Theme> = {
  fontWeight: 800,
  mb: 1,
};

export const copyButtonSx: SxProps<Theme> = { mt: 1.5 };
