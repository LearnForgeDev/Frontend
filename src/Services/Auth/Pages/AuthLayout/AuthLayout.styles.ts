import type { SxProps, Theme } from '@mui/material/styles';

export const pageSx: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'minmax(360px, 0.9fr) minmax(420px, 1.1fr)' },
  backgroundColor: 'var(--app-background)',
};

export const introSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: { xs: 'auto', md: '100vh' },
  p: { xs: 2.5, sm: 4, md: 6 },
  color: '#f8fbff',
  background: 'linear-gradient(145deg, #102956 0%, #1d4eb8 62%, #557be1 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 420,
    height: 420,
    right: -180,
    bottom: -210,
    borderRadius: '50%',
    border: '80px solid rgba(255, 255, 255, 0.08)',
  },
};

export const brandSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.25,
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: '1.05rem',
  position: 'relative',
  zIndex: 1,
};

export const logoFrameSx: SxProps<Theme> = {
  width: 38,
  height: 38,
};

export const logoSx: SxProps<Theme> = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'contain',
};

export const introContentSx: SxProps<Theme> = {
  my: 'auto',
  py: { xs: 5, md: 8 },
  maxWidth: 540,
  position: 'relative',
  zIndex: 1,
};

export const eyebrowSx: SxProps<Theme> = {
  mb: 2,
  fontSize: '0.76rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(248, 251, 255, 0.72)',
};

export const heroTitleSx: SxProps<Theme> = {
  maxWidth: 520,
  fontFamily: 'Manrope, sans-serif',
  fontSize: { xs: '2rem', sm: '2.7rem', md: 'clamp(2.6rem, 4.2vw, 4.25rem)' },
  fontWeight: 800,
  lineHeight: 1.04,
  letterSpacing: '-0.05em',
};

export const heroTextSx: SxProps<Theme> = {
  mt: 2.5,
  maxWidth: 470,
  fontSize: { xs: '1rem', md: '1.12rem' },
  lineHeight: 1.7,
  color: 'rgba(248, 251, 255, 0.78)',
};

export const featureListSx: SxProps<Theme> = {
  display: { xs: 'none', md: 'flex' },
  flexDirection: 'column',
  gap: 1.25,
  mt: 5,
};

export const featureSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  color: 'rgba(248, 251, 255, 0.9)',
  '& svg': { color: '#b9cafd' },
};

export const formPaneSx: SxProps<Theme> = {
  display: 'grid',
  placeItems: 'center',
  p: { xs: 2, sm: 4 },
};

export const paperSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: 440,
  p: { xs: 3, sm: 4.5 },
  border: '1px solid var(--app-border)',
  borderRadius: '24px',
  backgroundColor: 'var(--app-surface)',
  boxShadow: 'var(--app-shadow-md)',
};
