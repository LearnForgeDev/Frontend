import type { SxProps, Theme } from '@mui/material';

export const pageRootSx: SxProps<Theme> = {
  minHeight: '100vh',
  bgcolor: '#F9FAFB',
  pb: 8,
};

export const bannerSx = (imageUrl?: string, scrollY: number = 0): SxProps<Theme> => {
  const baseHeightXs = 200;
  const minHeightXs = 120;
  const currentHeightXs = Math.max(minHeightXs, baseHeightXs - scrollY * 0.5);

  const baseHeightMd = 350;
  const minHeightMd = 180;
  const currentHeightMd = Math.max(minHeightMd, baseHeightMd - scrollY * 0.7);

  return {
    height: { xs: currentHeightXs, sm: currentHeightMd },
    width: '100%',
    bgcolor: '#E5E7EB',
    backgroundImage: `url(${imageUrl || 'https://irecommend.ru/sites/default/files/imagecache/copyright1/user-images/2274752/dRCHsrtTtxHLTWldgpxTQ.jpg'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    mb: { xs: 4, sm: 6 },
  };
};

export const containerSx: SxProps<Theme> = {
  maxWidth: 1000,
  width: '100%',
  margin: '0 auto',
  px: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

export const backButtonSx: SxProps<Theme> = {
  position: 'absolute',
  top: 24,
  left: 24,
  bgcolor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.95)' },
  zIndex: 10,
};

export const profileSidebarSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  marginTop: { xs: -10, sm: -14 },
  position: 'relative',
  zIndex: 2,
};

export const notAuthContainerSx: SxProps<Theme> = {
  p: 4,
  display: 'flex',
  justifyContent: 'center',
  minHeight: '100vh',
  alignItems: 'center',
  bgcolor: '#F9FAFB',
};

export const widgetsContainerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  mt: 2,
};

export const statsGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
  gap: 3,
};
