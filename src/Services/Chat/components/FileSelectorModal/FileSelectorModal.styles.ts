import type { Theme } from '@mui/material/styles';

export const styles = {
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    maxHeight: '400px',
    overflowY: 'auto' as const,
    padding: (theme: Theme) => theme.spacing(2),
  },
  uploadArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: (theme: Theme) => theme.spacing(1.5),
    border: (theme: Theme) => `1px dashed ${theme.palette.divider}`,
    borderRadius: (theme: Theme) => `${theme.shape.borderRadius}px`,
    backgroundColor: (theme: Theme) => theme.palette.background.default,
  },
  listContainer: {
    width: '100%',
    bgcolor: 'background.paper',
  },
  fileIcon: {
    minWidth: '40px',
  },
};
