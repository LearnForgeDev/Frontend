import type { SxProps, Theme } from '@mui/material/styles';

export const pageSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  height: '100vh',
  p: { xs: 2, md: 3 },
  bgcolor: 'background.default',
  position: 'relative',
};

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: { xs: 'stretch', md: 'center' },
  gap: 2,
  flexDirection: { xs: 'column', md: 'row' },
  zIndex: 1,
};

export const meetingFrameSx: SxProps<Theme> = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  overflow: 'hidden',
  borderRadius: 0,
  bgcolor: 'background.paper',
};

export const centerStateSx: SxProps<Theme> = {
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 2,
};

export const moderatorAlertSx: SxProps<Theme> = {
  alignItems: 'center',
};