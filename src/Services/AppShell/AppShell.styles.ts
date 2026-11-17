import type { SxProps, Theme } from '@mui/material/styles';
import {
  APP_COLLAPSED_SIDEBAR_WIDTH_PX,
  APP_CONTENT_MAX_WIDTH_PX,
  APP_MOBILE_NAV_HEIGHT_PX,
  APP_SIDEBAR_WIDTH_PX,
  APP_TOPBAR_HEIGHT_PX,
} from './AppShell.const';

export const rootSx: SxProps<Theme> = {
  '--app-sidebar-width': `${APP_SIDEBAR_WIDTH_PX}px`,
  minHeight: '100vh',
  backgroundColor: 'var(--app-background)',
  color: 'var(--app-text)',
};

export const sidebarSx: SxProps<Theme> = {
  display: { xs: 'none', lg: 'flex' },
  position: 'fixed',
  inset: '0 auto 0 0',
  width: 'var(--app-sidebar-width)',
  flexDirection: 'column',
  overflowY: 'auto',
  borderRight: '1px solid var(--app-border)',
  backgroundColor: 'var(--app-surface)',
  zIndex: 1200,
};

export const brandSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.25,
  minHeight: APP_TOPBAR_HEIGHT_PX,
  px: 2.5,
  color: 'var(--app-text)',
  textDecoration: 'none',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: '1.05rem',
};

export const logoFrameSx: SxProps<Theme> = {
  width: 36,
  height: 36,
  flexShrink: 0,
};

export const logoSx: SxProps<Theme> = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'contain',
};

export const schoolSwitcherWrapSx: SxProps<Theme> = {
  flexShrink: 0,
  px: 1.5,
  pb: 2,
};

export const navigationSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  gap: 0.5,
  px: 1.5,
};

export const navigationItemSx: SxProps<Theme> = {
  minHeight: 46,
  borderRadius: '14px',
  gap: 1.25,
  px: 1.5,
  color: 'var(--app-text-muted)',
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    color: 'inherit',
  },
  '&.Mui-selected': {
    color: 'var(--app-primary-strong)',
    backgroundColor: 'var(--app-primary-soft)',
  },
  '&.Mui-selected:hover': {
    backgroundColor: 'var(--app-primary-soft-strong)',
  },
  '&:hover': {
    color: 'var(--app-text)',
    backgroundColor: 'var(--app-surface-muted)',
  },
  '&:active': {
    transform: 'translateY(1px)',
  },
  '&:focus-visible': {
    outline: '3px solid var(--app-focus)',
    outlineOffset: 2,
  },
};

export const mainSx: SxProps<Theme> = {
  ml: { xs: 0, lg: 'var(--app-sidebar-width)' },
  pb: { xs: `${APP_MOBILE_NAV_HEIGHT_PX}px`, lg: 0 },
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
};

export const contentSx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  width: '100%',
  maxWidth: APP_CONTENT_MAX_WIDTH_PX,
  mx: 'auto',
  px: { xs: 2, sm: 3, lg: 4 },
  pt: 2,
  pb: { xs: 2, sm: 3, lg: 4 },
  boxSizing: 'border-box',
};

export const mobileNavigationSx: SxProps<Theme> = {
  display: { xs: 'flex', lg: 'none' },
  position: 'fixed',
  inset: 'auto 0 0',
  height: APP_MOBILE_NAV_HEIGHT_PX,
  borderTop: '1px solid var(--app-border)',
  backgroundColor: 'var(--app-surface)',
  zIndex: 1200,
  '& .MuiBottomNavigationAction-root': {
    minWidth: 0,
    color: 'var(--app-text-subtle)',
  },
  '& .Mui-selected': {
    color: 'var(--app-primary-strong)',
  },
};

export const moreSheetSx: SxProps<Theme> = {
  borderTopLeftRadius: '24px',
  borderTopRightRadius: '24px',
  p: 2,
  backgroundColor: 'var(--app-surface)',
};

export const collapsedRootSx: SxProps<Theme> = {
  ...rootSx,
  '--app-sidebar-width': `${APP_COLLAPSED_SIDEBAR_WIDTH_PX}px`,
};

export const collapsedBrandSx: SxProps<Theme> = {
  ...brandSx,
  justifyContent: 'center',
  px: 0,
};

export const collapsedNavigationItemSx: SxProps<Theme> = {
  ...navigationItemSx,
  justifyContent: 'center',
  px: 0,
  gap: 0,
};

export const navigationLabelSx: SxProps<Theme> = {
  '& .MuiListItemText-primary': { fontWeight: 700 },
};

export const sidebarFooterSx: SxProps<Theme> = {
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
  flexShrink: 0,
  mt: 'auto',
  p: 1.5,
  display: 'flex',
  justifyContent: 'center',
};

export const sidebarToggleSx: SxProps<Theme> = {
  width: 44,
  height: 44,
  color: 'var(--app-text-muted)',
  borderRadius: '14px',
  '&:hover': {
    color: 'var(--app-text)',
    backgroundColor: 'var(--app-surface-muted)',
  },
  '&.Mui-focusVisible': {
    outline: '3px solid var(--app-focus)',
    outlineOffset: 2,
  },
};

export const canvasMainSx: SxProps<Theme> = { ...mainSx, height: '100dvh', overflow: 'hidden' };

export const canvasContentSx: SxProps<Theme> = { ...contentSx, maxWidth: 'none', minHeight: 0, px: 0, pt: 0, pb: 0, display: 'flex', flexDirection: 'column' };
