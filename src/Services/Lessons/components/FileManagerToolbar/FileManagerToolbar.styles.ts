import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  root: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: { xs: 'stretch', md: 'center' },
    justifyContent: 'space-between',
    gap: 2,
    py: 2,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  centerSection: {
    display: 'flex',
    alignItems: 'center',
    width: { xs: '100%', md: 'auto' },
    maxWidth: { md: 320 },
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.5,
  },
  searchField: {
    width: '100%',
    '& .MuiInputBase-root': {
      height: 40,
    },
  },
  selectField: {
    minWidth: 120,
    height: 40,
    '& .MuiInputBase-root': {
      height: 40,
    },
  },
  collapsedSearchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
};
