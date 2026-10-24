import type { SxProps, Theme } from '@mui/material';

export const page: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  px: { xs: 2, sm: 4 },
  py: { xs: 2, sm: 4 },
  gap: { xs: 3, sm: 4 },
  bgcolor: 'background.default',
};

export const header: SxProps<Theme> = {
  width: '100%',
  maxWidth: 920,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 1,
};

export const progress: SxProps<Theme> = {
  width: '100%',
  maxWidth: 600,
};

export const content = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  my: 'auto',
  py: { xs: 1, sm: 3 },
};

export const selectionContent: SxProps<Theme> = {
  ...content,
  my: 0,
  py: { xs: 2, sm: 4 },
};

export const brand: SxProps<Theme> = {
  fontWeight: 700,
};
