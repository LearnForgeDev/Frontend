import type { Theme } from '@mui/material/styles';

export const styles = {
  container: {
    padding: (theme: Theme) => theme.spacing(4),
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    marginBottom: (theme: Theme) => theme.spacing(4),
  },
  formCard: {
    padding: (theme: Theme) => theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    gap: (theme: Theme) => theme.spacing(3),
    boxShadow: (theme: Theme) => theme.shadows[3],
    borderRadius: (theme: Theme) => (theme.shape.borderRadius as number) * 2,
    background: (theme: Theme) => theme.palette.background.paper,
    marginBottom: (theme: Theme) => theme.spacing(4),
  },
  resultBox: {
    padding: (theme: Theme) => theme.spacing(3),
    border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    borderRadius: (theme: Theme) => theme.shape.borderRadius,
    background: (theme: Theme) => theme.palette.action.hover,
    display: 'flex',
    alignItems: 'center',
    gap: (theme: Theme) => theme.spacing(2),
    marginBottom: (theme: Theme) => theme.spacing(4),
  },
  urlText: {
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'monospace',
  },
  jitsiContainer: {
    flexGrow: 1,
    minHeight: '600px',
    borderRadius: (theme: Theme) => theme.shape.borderRadius,
    overflow: 'hidden',
    border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
  }
};
