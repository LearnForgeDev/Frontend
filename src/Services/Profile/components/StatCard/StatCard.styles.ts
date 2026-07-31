import type { SxProps, Theme } from '@mui/material';

export const widgetCardSx: SxProps<Theme> = {
  p: 3,
  borderRadius: 2,
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'rgba(0,0,0,0.04)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
};

export const widgetTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  fontFamily: 'Manrope, sans-serif',
  color: '#374151',
  fontSize: '1rem',
};

export const statValueSx: SxProps<Theme> = {
  fontWeight: 800,
  fontFamily: 'Manrope, sans-serif',
  color: '#111827',
  fontSize: '2rem',
  lineHeight: 1,
};

export const statLabelSx: SxProps<Theme> = {
  fontWeight: 500,
  color: '#6B7280',
  fontSize: '0.875rem',
};
