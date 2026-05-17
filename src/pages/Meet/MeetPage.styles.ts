import type { SxProps, Theme } from '@mui/material/styles';

export const pageSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minHeight: '100vh',
  p: { xs: 2, md: 3 },
  bgcolor: 'background.default',
};

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: { xs: 'stretch', md: 'center' },
  gap: 2,
  flexDirection: { xs: 'column', md: 'row' },
};

export const meetingFrameSx: SxProps<Theme> = {
  flex: 1,
  minHeight: { xs: 520, md: 640 },
  overflow: 'hidden',
  borderRadius: 2,
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