import type { SxProps, Theme } from '@mui/material/styles';
import {
  APP_CONTENT_MAX_WIDTH_PX,
  APP_MOBILE_NAV_HEIGHT_PX,
  APP_SIDEBAR_WIDTH_PX,
  APP_TOPBAR_HEIGHT_PX,
} from './AppShell.const';

export const rootSx: SxProps<Theme> = {
  minHeight: '100vh',
  backgroundColor: 'var(--app-background)',
  color: 'var(--app-text)',
};

export const sidebarSx: SxProps<Theme> = {
  display: { xs: 'none', lg: 'flex' },
  position: 'fixed',
  inset: '0 auto 0 0',
  width: APP_SIDEBAR_WIDTH_PX,
  flexDirection: 'column',
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
  px: 1.5,
  pb: 2,
};

export const schoolSwitcherSx: SxProps<Theme> = {
  width: '100%',
  minHeight: 58,
  justifyContent: 'space-between',
  border: '1px solid var(--app-border)',
  borderRadius: '16px',
  backgroundColor: 'var(--app-surface-subtle)',
  color: 'var(--app-text)',
  px: 1.5,
  textTransform: 'none',
  '&:hover': {
    borderColor: 'var(--app-border-strong)',
    backgroundColor: 'var(--app-surface-muted)',
  },
};

export const navigationSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
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

export const avatarSx: SxProps<Theme> = {
  width: 34,
  height: 34,
  bgcolor: 'var(--app-primary-soft)',
  color: 'var(--app-primary-strong)',
  fontSize: '0.78rem',
  fontWeight: 800,
};

export const profileNameSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: '0.86rem',
};

export const profileHintSx: SxProps<Theme> = {
  color: 'var(--app-text-subtle)',
  fontSize: '0.72rem',
};

export const topbarProfileButtonSx: SxProps<Theme> = {
  minWidth: 40,
  minHeight: 44,
  gap: 1,
  px: { xs: 0.5, sm: 1 },
  borderRadius: '12px',
  color: 'var(--app-text-muted)',
  textTransform: 'none',
};

export const topbarProfileTextSx: SxProps<Theme> = {
  display: { xs: 'none', sm: 'block' },
  minWidth: 0,
  maxWidth: 180,
  textAlign: 'left',
};

export const topbarSx: SxProps<Theme> = {
  position: 'fixed',
  top: 0,
  right: 0,
  left: { xs: 0, lg: `${APP_SIDEBAR_WIDTH_PX}px` },
  height: APP_TOPBAR_HEIGHT_PX,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: { xs: 2, sm: 3, lg: 4 },
  borderBottom: '1px solid var(--app-border)',
  backgroundColor: 'color-mix(in srgb, var(--app-background) 88%, transparent)',
  backdropFilter: 'blur(18px)',
  zIndex: 1100,
};

export const mobileBrandSx: SxProps<Theme> = {
  display: { xs: 'flex', lg: 'none' },
  alignItems: 'center',
  gap: 1,
};

export const titleSx: SxProps<Theme> = {
  fontFamily: 'Manrope, sans-serif',
  fontSize: { xs: '1.05rem', sm: '1.2rem' },
  fontWeight: 800,
  color: 'var(--app-text)',
};

export const mainSx: SxProps<Theme> = {
  ml: { xs: 0, lg: `${APP_SIDEBAR_WIDTH_PX}px` },
  pt: `${APP_TOPBAR_HEIGHT_PX}px`,
  pb: { xs: `${APP_MOBILE_NAV_HEIGHT_PX + 16}px`, lg: 0 },
  minHeight: '100vh',
};

export const contentSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: APP_CONTENT_MAX_WIDTH_PX,
  mx: 'auto',
  p: { xs: 2, sm: 3, lg: 4 },
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
