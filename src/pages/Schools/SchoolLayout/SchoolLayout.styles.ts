import type { SxProps, Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

export const schoolHeaderSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.15rem',
};

export const schoolDrawerTitleSx: SxProps<Theme> = {
  fontSize: '1.1rem',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  margin: 0,
  color: 'var(--admin-text)',
};

export const schoolDrawerSubtitleSx: SxProps<Theme> = {
  margin: '0.2rem 0 0',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'color-mix(in srgb, var(--admin-text) 55%, transparent)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

export const schoolDrawerSectionTitleSx: SystemStyleObject<Theme> = {
  fontSize: '0.7rem',
  fontWeight: 800,
  color: 'var(--admin-muted)',
  margin: '0.4rem 0 0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  padding: '0 0.85rem',
};

export const schoolNavItemSx: SxProps<Theme> = {
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
};

export const schoolNavIconSx: SxProps<Theme> = {
  minWidth: 'auto',
  color: 'color-mix(in srgb, var(--admin-text) 60%, transparent)',
};
