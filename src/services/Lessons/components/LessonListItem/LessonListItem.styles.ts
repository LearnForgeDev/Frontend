import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    p: 1.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  },
  rowSelected: {
    backgroundColor: 'primary.light',
    '&:hover': {
      backgroundColor: 'primary.light',
    },
  },
  icon: {
    fontSize: '1.75rem',
    mr: 2,
    color: 'primary.main',
  },
  title: {
    flexGrow: 1,
    fontWeight: 500,
    fontSize: '0.95rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    mr: 2,
  },
  metaContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  wordCount: {
    fontSize: '0.8rem',
    color: 'text.secondary',
    minWidth: 80,
    textAlign: 'right',
  },
  date: {
    fontSize: '0.8rem',
    color: 'text.secondary',
    minWidth: 100,
    textAlign: 'right',
  },
  statusChip: {
    minWidth: 90,
  },
};
