import type { SxProps, Theme } from '@mui/material/styles';

export const pageSx: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: { xs: 2, md: 3 },
  bgcolor: 'background.default',
};

export const formPaperSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: 720,
  p: { xs: 2, sm: 3 },
  borderRadius: 3,
  bgcolor: 'background.paper',
};

export const titleSx: SxProps<Theme> = {
  mb: 1,
};

export const descriptionSx: SxProps<Theme> = {
  mb: 3,
};

export const formGridSx: SxProps<Theme> = {
  alignItems: 'stretch',
};

export const actionsSx: SxProps<Theme> = {
  mt: 2,
  justifyContent: 'flex-end',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 1.5,
};

export const alertSx: SxProps<Theme> = {
  mt: 2,
};

