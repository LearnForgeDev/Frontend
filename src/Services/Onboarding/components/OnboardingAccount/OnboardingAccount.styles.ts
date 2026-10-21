import type { SxProps, Theme } from '@mui/material';

export const root: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 1,
};

export const username: SxProps<Theme> = {
  color: 'text.secondary',
  overflowWrap: 'anywhere',
  minWidth: 0,
};
