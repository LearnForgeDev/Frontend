import type { SxProps, Theme } from '@mui/material';

export const helperText: SxProps<Theme> = {
  color: 'text.primary',
};

export const input = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
  },
};

export const submitButton: SxProps<Theme> = {
  minHeight: 48,
  borderRadius: '14px',
  textTransform: 'none',
  boxShadow: 'none',
};
