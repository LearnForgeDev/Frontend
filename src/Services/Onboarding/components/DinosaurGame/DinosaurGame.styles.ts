import type { SxProps, Theme } from '@mui/material';

export const container: SxProps<Theme> = {
  p: 2,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  bgcolor: 'background.paper',
};

export const loading: SxProps<Theme> = {
  display: 'grid',
  placeItems: 'center',
  py: 3,
};

export const error: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 1,
};

export const widget: SxProps<Theme> = {
  width: '100%',
  '&.g404-root': { display: 'flex', flexDirection: 'column' },
  '& .g404-banner': { order: 0, textAlign: 'left', px: 0 },
  '& .g404-hud': { order: 1 },
  '& .g404-canvas-wrap': { order: 2 },
  '& .g404-canvas': { width: '100% !important', height: 'auto !important' },
  '& .g404-banner-title, & .g404-screen-title': { letterSpacing: 'normal', textShadow: 'none' },
  '& .g404-screen-title': { typography: 'h5' },
  '& .g404-screen-sub': { textAlign: 'center', px: 1 },
  '& .g404-btn': { minHeight: 44, letterSpacing: 'normal' },
  '& .g404-canvas:focus-visible, & .g404-btn:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
};
