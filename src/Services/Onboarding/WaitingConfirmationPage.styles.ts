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
  maxWidth: 760,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export const statusCard: SxProps<Theme> = {
  p: { xs: 3, sm: 5 },
  borderRadius: 5,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 20px 60px rgba(38, 55, 92, 0.10)',
};

export const actionsCard: SxProps<Theme> = {
  p: { xs: 2.5, sm: 3 },
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
};

export const actionHeader: SxProps<Theme> = {
  display: 'flex',
  alignItems: { xs: 'flex-start', sm: 'center' },
  justifyContent: 'space-between',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 1,
  mb: 2,
};

export const actionTitle: SxProps<Theme> = {
  fontWeight: 750,
};

export const gameButton: SxProps<Theme> = {
  alignSelf: 'center',
  borderRadius: 3,
  textTransform: 'none',
};

export const loading: SxProps<Theme> = {
  minHeight: 240,
  display: 'grid',
  placeItems: 'center',
};

export const retry: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 2,
};

export const retryTitle: SxProps<Theme> = {
  fontWeight: 800,
};

export const provisioningRetry: SxProps<Theme> = {
  mt: 3,
  display: 'flex',
  justifyContent: 'center',
};
