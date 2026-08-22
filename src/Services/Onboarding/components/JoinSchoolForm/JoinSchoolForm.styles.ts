import type { SxProps, Theme } from '@mui/material';

export const form: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export const fieldRow: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  alignItems: 'flex-start',
};

export const submitButton: SxProps<Theme> = {
  minHeight: 48,
  borderRadius: 3,
  px: 3,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  boxShadow: 'none',
};

export const input = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
  },
};

export const helperText: SxProps<Theme> = {
  color: 'text.secondary',
};
