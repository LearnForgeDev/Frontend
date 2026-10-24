import type { SxProps, Theme } from '@mui/material';
import { PROFILE_SECTION_ACTION_SIZE_PX } from './ProfileSectionHeader.const';

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: { xs: 0.5, sm: 1 },
  minHeight: PROFILE_SECTION_ACTION_SIZE_PX,
  mb: { xs: 0.5, sm: 1.5 },
};

export const titleSx: SxProps<Theme> = {
  color: 'var(--admin-text)',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: { xs: '0.875rem', sm: '1.05rem' },
  minWidth: 0,
  overflowWrap: 'anywhere',
};

export const addButtonSx: SxProps<Theme> = {
  width: PROFILE_SECTION_ACTION_SIZE_PX,
  height: PROFILE_SECTION_ACTION_SIZE_PX,
  flexShrink: 0,
  borderRadius: 2,
  color: 'var(--admin-primary)',
  bgcolor: 'color-mix(in srgb, var(--admin-primary) 10%, transparent)',
  '&:hover': {
    bgcolor: 'color-mix(in srgb, var(--admin-primary) 16%, transparent)',
  },
  '&.Mui-focusVisible': {
    outline: '2px solid var(--admin-primary)',
    outlineOffset: 2,
  },
};
