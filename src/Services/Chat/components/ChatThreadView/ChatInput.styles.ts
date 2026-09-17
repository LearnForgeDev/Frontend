import type { Theme } from '@mui/material/styles';

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  attachedFiles: {
    p: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    bgcolor: 'background.default',
  },
  attachedFileChip: {
    maxWidth: 150,
  },
  attachIcon: {
    transform: 'rotate(45deg)',
  },
  controls: {
    display: 'flex',
    gap: 1,
    width: '100%',
    alignItems: 'center',
  },
  sendButton: {
    alignSelf: 'flex-end',
  },
};
