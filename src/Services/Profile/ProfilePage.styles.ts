import type { SxProps, Theme } from '@mui/material';
import { PROFILE_CARDS_STACK_MAX_WIDTH_PX } from './ProfilePage.const';

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
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: { xs: 1, sm: 2 },
  [`@media (width > ${PROFILE_CARDS_STACK_MAX_WIDTH_PX}px)`]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  alignItems: 'stretch',
  gridAutoRows: '1fr',
};

export const notAuthContainerSx: SxProps<Theme> = {
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--admin-muted)',
};
