import type { SxProps, Theme } from '@mui/material/styles';

export const pageSx: SxProps<Theme> = {
  minHeight: '100vh',
  p: { xs: 2, md: 4 },
  backgroundColor: 'var(--app-background)',
};

export const contentSx: SxProps<Theme> = { maxWidth: 1120, mx: 'auto' };

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: { xs: 'stretch', sm: 'center' },
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
  mb: 3,
};

export const titleSx: SxProps<Theme> = {
  fontFamily: 'Manrope, sans-serif',
  fontSize: { xs: '1.8rem', md: '2.4rem' },
  fontWeight: 800,
  letterSpacing: '-0.04em',
};

export const subtitleSx: SxProps<Theme> = { mt: 0.5, color: 'var(--app-text-muted)' };

export const listSx: SxProps<Theme> = { display: 'flex', flexDirection: 'column', gap: 1.5 };

export const requestSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: { xs: 'stretch', md: 'center' },
  justifyContent: 'space-between',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2,
  p: 2.5,
  border: '1px solid var(--app-border)',
  borderRadius: '20px',
  backgroundColor: 'var(--app-surface)',
};

export const metaSx: SxProps<Theme> = { color: 'var(--app-text-muted)', fontSize: '0.82rem' };

export const actionsSx: SxProps<Theme> = { display: 'flex', gap: 1, flexWrap: 'wrap' };
