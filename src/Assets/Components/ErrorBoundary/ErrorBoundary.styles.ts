import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: 3,
    textAlign: 'center',
  },
  title: {
    marginBottom: 2,
    fontWeight: 600,
  },
  message: {
    marginBottom: 3,
    color: 'text.secondary',
  },
  button: {
    marginTop: 2,
  },
};
