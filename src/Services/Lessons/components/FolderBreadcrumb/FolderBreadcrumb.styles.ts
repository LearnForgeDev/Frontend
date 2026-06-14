import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    py: 1,
  },
  rootLink: {
    cursor: 'pointer',
    color: 'text.secondary',
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
      color: 'primary.main',
    },
  },
  folderLink: {
    cursor: 'pointer',
    color: 'text.secondary',
    textDecoration: 'none',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&:hover': {
      textDecoration: 'underline',
      color: 'primary.main',
    },
  },
  currentFolder: {
    color: 'text.primary',
    fontWeight: 600,
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
