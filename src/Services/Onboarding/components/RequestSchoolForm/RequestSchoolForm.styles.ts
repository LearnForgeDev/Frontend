import type { SxProps, Theme } from '@mui/material';

export const helperText: SxProps<Theme> = {
  color: 'text.secondary',
};

export const input = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
  },
};

export const submitButton: SxProps<Theme> = {
  minHeight: 48,
  borderRadius: 3,
  textTransform: 'none',
  boxShadow: 'none',
};
