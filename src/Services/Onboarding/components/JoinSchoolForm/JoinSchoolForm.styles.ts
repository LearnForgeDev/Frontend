import type { SxProps, Theme } from '@mui/material';

export const form: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
};

export const submitButton: SxProps<Theme> = {
  minHeight: 48,
  textTransform: 'none',
  boxShadow: 'none',
};

export const helperText: SxProps<Theme> = {
  color: 'text.primary',
};

export const instructions: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
};

export const instructionTitle: SxProps<Theme> = {
  fontSize: '1.25rem',
  lineHeight: 1.4,
  fontWeight: 750,
  color: 'text.primary',
};

export const instructionDescription: SxProps<Theme> = {
  color: 'text.primary',
};

export const input: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
  },
};

export const confirmationText: SxProps<Theme> = {
  color: 'text.primary',
  mb: 2,
};

export const error: SxProps<Theme> = {
  mb: 2,
};
