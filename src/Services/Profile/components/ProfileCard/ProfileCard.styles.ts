import type { SxProps, Theme } from '@mui/material';

export const profileCardSx: SxProps<Theme> = {
  p: 4,
  borderRadius: 2,
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'center',
  textAlign: { xs: 'center', md: 'left' },
  gap: { xs: 3, md: 4 },
  boxShadow: '0 12px 48px rgba(0,0,0,0.06)',
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'rgba(0,0,0,0.04)',
};

export const avatarContainerSx: SxProps<Theme> = {
  position: 'relative',
  mb: { xs: 3, md: 0 },
  flexShrink: 0,
};

export const avatarSx: SxProps<Theme> = {
  width: 140,
  height: 140,
  bgcolor: 'primary.main',
  fontSize: '4rem',
  fontWeight: 800,
  fontFamily: 'Manrope, sans-serif',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  border: '4px solid #fff',
};

export const avatarOverlaySx: SxProps<Theme> = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  bgcolor: 'background.paper',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  '&:hover': { bgcolor: 'action.hover' },
};

export const hiddenInputSx: SxProps<Theme> = {
  display: 'none',
};

export const userNameSx: SxProps<Theme> = {
  fontWeight: 800,
  fontFamily: 'Manrope, sans-serif',
  color: '#111827', // off-black
  mb: 1,
  lineHeight: 1.2,
};

export const userInfoStackSx: SxProps<Theme> = {
  mt: 1.5,
  mb: 2.5,
};

export const contactItemSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  color: '#6B7280',
};

export const contactIconSx: SxProps<Theme> = {
  color: '#9CA3AF',
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
  width: { xs: '100%', md: 'auto' },
  px: { xs: 2, md: 4 },
  py: 1.5,
  bgcolor: '#FEF2F2',
  color: '#DC2626',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: '#FEE2E2',
    boxShadow: 'none',
  },
};

export const adminButtonSx: SxProps<Theme> = {
  borderRadius: 3,
  textTransform: 'none',
  fontWeight: 700,
  fontFamily: 'Manrope, sans-serif',
  width: { xs: '100%', md: 'auto' },
  px: { xs: 2, md: 4 },
  py: 1.5,
  bgcolor: 'transparent',
  color: '#4B5563',
  border: '1px solid',
  borderColor: '#D1D5DB',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: '#F3F4F6',
    boxShadow: 'none',
  },
};

export const buttonsContainerSx: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  flexDirection: { xs: 'column', md: 'row' },
  mt: { xs: 3, md: 0 },
};
