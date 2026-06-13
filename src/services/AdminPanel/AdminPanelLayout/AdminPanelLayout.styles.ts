import type { SxProps, Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

export const SIDEBAR_WIDTH = 256;

export const layoutRootSx: SxProps<Theme> = {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: 'var(--admin-bg)',
  color: 'var(--admin-text)',
};

export const drawerRootSx: SxProps<Theme> = {
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
  },
};

export const drawerPaperSx: SxProps<Theme> = {
  width: SIDEBAR_WIDTH,
  borderRight: 0,
  backgroundColor: 'var(--admin-surface-low)',
};

export const drawerContentSx: SxProps<Theme> = {
  width: SIDEBAR_WIDTH,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--admin-surface-low)',
  padding: '2rem 1rem',
  boxSizing: 'border-box',
};

export const drawerHeaderSx: SxProps<Theme> = {
  marginBottom: '2.2rem',
  padding: '0 0.85rem',
};

export const drawerTitleSx: SxProps<Theme> = {
  fontSize: '1.25rem',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  margin: 0,
  color: 'var(--admin-text)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.45rem',
};

export const drawerSubtitleSx: SxProps<Theme> = {
  margin: '0.25rem 0 0',
  fontSize: '0.67rem',
  fontWeight: 700,
  color: 'color-mix(in srgb, var(--admin-text) 55%, transparent)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

export const navListSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  padding: '0 0.2rem',
};

export const navSectionTitleSx: SystemStyleObject<Theme> = {
  fontSize: '0.75rem',
  fontWeight: 800,
  color: 'var(--admin-muted)',
  margin: '0.4rem 0 0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  padding: '0 0.85rem',
};

export const navSectionTitleMarginSx: SystemStyleObject<Theme> = {
  margin: '2rem 0 0.5rem',
};

export const navItemSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  padding: '0.8rem 0.85rem',
  borderRadius: '0.8rem',
  backgroundColor: 'transparent',
  color: 'color-mix(in srgb, var(--admin-text) 70%, transparent)',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 600,
  transition: 'all 0.25s',
  '&.Mui-selected': {
    backgroundColor: '#ffffff',
    color: 'var(--admin-primary)',
    borderTopRightRadius: '999px',
    borderBottomRightRadius: '999px',
    transform: 'translateX(4px)',
    boxShadow: '0 8px 18px rgba(48, 51, 48, 0.08)',
  },
  '&:hover': {
    color: 'var(--admin-primary)',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  '&.Mui-disabled': {
    cursor: 'default',
    opacity: 0.72,
  },
  '&.Mui-disabled:hover': {
    color: 'color-mix(in srgb, var(--admin-text) 70%, transparent)',
    backgroundColor: 'transparent',
  },
};

export const navIconSx: SxProps<Theme> = {
  minWidth: 'auto',
  color: 'color-mix(in srgb, var(--admin-text) 60%, transparent)',
};

export const navFooterSx: SxProps<Theme> = {
  marginTop: 'auto',
  borderTop: '1px solid rgba(48, 51, 48, 0.06)',
  padding: '1.2rem 0.85rem 0',
};

export const backLinkSx: SxProps<Theme> = {
  padding: 0,
  color: 'color-mix(in srgb, var(--admin-text) 75%, transparent)',
};

export const backLinkIconSx: SxProps<Theme> = {
  minWidth: 'auto',
  marginRight: '0.4rem',
};

export const appBarSx = (isDesktop: boolean): SxProps<Theme> => ({
  left: isDesktop ? `${SIDEBAR_WIDTH}px` : 0,
  width: isDesktop ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
  height: '64px',
  justifyContent: 'center',
  background: 'rgba(250, 249, 246, 0.8)',
  borderBottom: '1px solid rgba(48, 51, 48, 0.06)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
});

export const toolbarSx = (isDesktop: boolean): SxProps<Theme> => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: isDesktop ? '0 2rem' : '0 1rem 0 3.9rem',
});

export const menuButtonSx: SxProps<Theme> = {
  position: 'absolute',
  left: '0.6rem',
  border: '1px solid var(--admin-border)',
  borderRadius: '0.7rem',
  background: 'var(--admin-surface)',
  color: 'var(--admin-text)',
  width: 40,
  height: 40,
};

export const crumbsSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.45rem',
  color: 'color-mix(in srgb, var(--admin-text) 70%, transparent)',
  fontSize: '0.9rem',
};

export const crumbsTitleSx: SxProps<Theme> = {
  color: 'var(--admin-primary)',
  fontWeight: 800,
};

export const topbarRightSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.9rem',
};

export const searchFieldSx: SxProps<Theme> = {
  minWidth: 240,
  '& .MuiInputBase-root': {
    borderRadius: '0.7rem',
    background: 'var(--admin-surface-container)',
    paddingLeft: '0.4rem',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 0,
  },
  '& input': {
    fontSize: '0.85rem',
    color: 'var(--admin-text)',
  },
};

export const topbarIconButtonSx: SxProps<Theme> = {
  color: 'color-mix(in srgb, var(--admin-text) 75%, transparent)',
};

export const avatarSx: SxProps<Theme> = {
  width: 32,
  height: 32,
  borderRadius: '999px',
  background: 'var(--admin-surface-high)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--admin-primary)',
  fontWeight: 700,
  fontSize: '0.75rem',
};

export const mainContentSx = (isDesktop: boolean): SxProps<Theme> => ({
  flex: 1,
  marginLeft: isDesktop ? `${SIDEBAR_WIDTH}px` : 0,
  padding: isDesktop ? '88px 2.25rem 2rem' : '5rem 1rem 1rem',
  width: '100%',
  boxSizing: 'border-box',
});
