import type { SxProps, Theme } from '@mui/material/styles';
import type { UploadItemProgress } from './FileUploadProgress';

type UploadStatus = UploadItemProgress['status'];

const getStatusColor = (theme: Theme, status: UploadStatus): string => {
  if (status === 'error') return theme.palette.error.main;
  if (status === 'completed') return theme.palette.success.main;
  if (status === 'cancelled') return theme.palette.text.disabled;
  return theme.palette.primary.main;
};

export const rootSx: SxProps<Theme> = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 1400,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  maxWidth: 380,
  width: 'calc(100vw - 48px)',
};

export const getItemSx = (status: UploadStatus): SxProps<Theme> => ({
  p: 2,
  borderRadius: 2.5,
  backdropFilter: 'blur(12px)',
  backgroundColor: 'color-mix(in srgb, var(--app-surface) 90%, transparent)',
  border: '1px solid',
  borderColor: (theme) => getStatusColor(theme, status),
  boxShadow: 'var(--app-shadow-md)',
});

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  mb: 1,
};

export const getIconSx = (status: UploadStatus): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  flexShrink: 0,
  borderRadius: '50%',
  color: (theme) => getStatusColor(theme, status),
  backgroundColor: 'var(--app-surface-muted)',
});

export const fileInfoSx: SxProps<Theme> = {
  flexGrow: 1,
  minWidth: 0,
};

export const fileNameSx: SxProps<Theme> = {
  fontWeight: 600,
  fontSize: '0.875rem',
};

export const getPercentSx = (status: UploadStatus): SxProps<Theme> => ({
  fontWeight: 700,
  fontSize: '0.8rem',
  color: (theme) => getStatusColor(theme, status),
});

export const progressSx: SxProps<Theme> = {
  height: 6,
  borderRadius: 3,
  backgroundColor: 'var(--app-surface-muted)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    transition: 'transform 0.2s linear',
  },
};

export const cancelButtonSx: SxProps<Theme> = {
  minWidth: 0,
  px: 1,
  color: 'var(--app-text-muted)',
};
