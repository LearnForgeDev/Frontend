import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  paper: { minWidth: 160 },
  deleteItem: { color: 'error.main' },
  deleteIcon: { marginRight: 1.5, fontSize: '1.25rem', color: 'error.main' },
  menuItemIcon: {
    marginRight: 1.5,
    fontSize: '1.25rem',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 1,
  },
  modalTitle: {
    fontWeight: 600,
  },
  modalBody: {
    color: 'text.secondary',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1.5,
    marginTop: 2,
  },
};
