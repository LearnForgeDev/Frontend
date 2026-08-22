import type { SxProps, Theme } from '@mui/material';

export const pageRootSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: 1000,
  mx: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
};

export const pageTitleSx: SxProps<Theme> = {
  color: 'var(--admin-text)',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: { xs: '2rem', md: '2.5rem' },
  letterSpacing: '-0.04em',
};

export const subtitleSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
};

export const contentGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(300px, 0.72fr)' },
  gap: 2,
  alignItems: 'start',
};

export const sectionSx: SxProps<Theme> = {
  p: { xs: 2, md: 2.5 },
  borderRadius: 3,
  border: '1px solid var(--admin-border)',
  bgcolor: 'var(--admin-surface)',
  boxShadow: 'var(--admin-shadow)',
};

export const sectionTitleSx: SxProps<Theme> = {
  color: 'var(--admin-text)',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: '1.05rem',
  mb: 1.5,
};

export const schoolsListSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
};

export const schoolRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  py: 1.5,
  borderTop: '1px solid var(--admin-border)',
  '&:first-of-type': {
    borderTop: 0,
  },
};

export const schoolIconSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  flexShrink: 0,
  borderRadius: 2,
  color: 'var(--admin-primary)',
  bgcolor: 'color-mix(in srgb, var(--admin-primary) 10%, transparent)',
};

export const schoolNameSx: SxProps<Theme> = {
  color: 'var(--admin-text)',
  fontWeight: 700,
};

export const schoolRolesSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  fontSize: '0.82rem',
  mt: 0.2,
};

export const eventEmptySx: SxProps<Theme> = {
  minHeight: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--admin-muted)',
  textAlign: 'center',
};

export const notAuthContainerSx: SxProps<Theme> = {
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--admin-muted)',
};
