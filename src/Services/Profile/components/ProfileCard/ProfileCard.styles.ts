import type { SxProps, Theme } from '@mui/material';

export const profileCardSx: SxProps<Theme> = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 3,
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'flex-start', sm: 'center' },
  gap: 2.5,
  bgcolor: 'var(--admin-surface)',
  border: '1px solid',
  borderColor: 'var(--admin-border)',
  boxShadow: 'var(--admin-shadow)',
};

export const avatarSx: SxProps<Theme> = {
  width: 76,
  height: 76,
  bgcolor: 'var(--admin-primary)',
  fontSize: '1.6rem',
  fontWeight: 800,
  fontFamily: 'Manrope, sans-serif',
};

export const userNameSx: SxProps<Theme> = {
  fontWeight: 800,
  fontFamily: 'Manrope, sans-serif',
  color: 'var(--admin-text)',
  mb: 0.75,
  lineHeight: 1.2,
  fontSize: { xs: '1.5rem', md: '1.8rem' },
};

export const userInfoStackSx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
};

export const contactItemSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  color: 'var(--admin-muted)',
  py: 0.25,
};

export const contactIconSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  fontSize: '1.25rem',
};

export const contactTextSx: SxProps<Theme> = {
  fontWeight: 500,
  fontSize: '0.95rem',
};

export const logoutButtonSx: SxProps<Theme> = {
  borderRadius: 3,
  textTransform: 'none',
  fontWeight: 700,
  fontFamily: 'Manrope, sans-serif',
  width: { xs: '100%', sm: 'auto' },
  px: 2,
  color: 'var(--admin-danger)',
  borderColor: 'color-mix(in srgb, var(--admin-danger) 35%, transparent)',
  '&:hover': {
    borderColor: 'var(--admin-danger)',
    bgcolor: 'color-mix(in srgb, var(--admin-danger) 7%, transparent)',
  },
};
