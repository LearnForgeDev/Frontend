import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  gridCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    backgroundColor: 'background.paper',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'action.hover',
      boxShadow: 1,
    },
  },
  gridCardSelected: {
    borderColor: 'primary.main',
    backgroundColor: 'primary.light',
    '&:hover': {
      backgroundColor: 'primary.light',
    },
  },
  gridIcon: {
    fontSize: '3.5rem',
    mb: 1,
  },
  gridTitle: {
    fontWeight: 500,
    fontSize: '0.875rem',
    textAlign: 'center',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  listRow: {
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
  listRowSelected: {
    backgroundColor: 'primary.light',
    '&:hover': {
      backgroundColor: 'primary.light',
    },
  },
  listIcon: {
    fontSize: '1.75rem',
    mr: 2,
  },
  listTitle: {
    flexGrow: 1,
    fontWeight: 500,
    fontSize: '0.95rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  listMeta: {
    color: 'text.secondary',
    fontSize: '0.8rem',
    mr: 3,
  },
};
