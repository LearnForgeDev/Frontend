import type { SxProps, Theme } from '@mui/material';

export const page: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: { xs: 2, sm: 4 },
  py: 5,
  bgcolor: 'background.default',
};

export const content: SxProps<Theme> = {
  width: '100%',
  maxWidth: 920,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

export const header: SxProps<Theme> = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
};

export const title: SxProps<Theme> = {
  fontWeight: 800,
  color: 'text.primary',
};

export const subtitle: SxProps<Theme> = {
  color: 'text.secondary',
};

export const scenarios: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
  gap: 2,
};

export const primaryCard: SxProps<Theme> = {
  p: { xs: 2.5, sm: 4 },
  borderRadius: 5,
  border: '1px solid',
  borderColor: 'primary.light',
  boxShadow: '0 20px 60px rgba(38, 55, 92, 0.10)',
};

export const secondaryCard: SxProps<Theme> = {
  p: { xs: 2.5, sm: 4 },
  borderRadius: 5,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
};

export const cardHeader: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  mb: 2,
};

export const cardTitle: SxProps<Theme> = {
  fontWeight: 750,
};

export const eyebrow: SxProps<Theme> = {
  color: 'primary.main',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};
