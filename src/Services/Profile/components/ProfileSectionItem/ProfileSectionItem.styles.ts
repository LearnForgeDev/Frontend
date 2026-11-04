import type { SxProps, Theme } from '@mui/material';

export const itemSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: { xs: 1, sm: 1.5 },
  minWidth: 0,
  py: 1.5,
  borderTop: '1px solid var(--admin-border)',
  '&:first-of-type': { borderTop: 0 },
};

export const iconSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: { xs: 32, sm: 40 },
  height: { xs: 32, sm: 40 },
  flexShrink: 0,
  borderRadius: 2,
  color: 'var(--admin-primary)',
  bgcolor: 'color-mix(in srgb, var(--admin-primary) 10%, transparent)',
};

export const contentSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  minWidth: 0,
  flex: 1,
  overflowWrap: 'anywhere',
};

export const titleSx: SxProps<Theme> = {
  color: 'var(--admin-text)',
  fontWeight: 700,
  fontSize: { xs: '0.875rem', sm: '1rem' },
};

export const emptyTitleSx: SxProps<Theme> = {
  ...titleSx,
  color: 'var(--admin-muted)',
  fontWeight: 400,
};

export const detailsSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  fontSize: { xs: '0.75rem', sm: '0.82rem' },
};

export const actionSx: SxProps<Theme> = {
  alignSelf: 'flex-start',
  maxWidth: '100%',
  mt: 1,
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 700,
  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
  overflowWrap: 'anywhere',
};
