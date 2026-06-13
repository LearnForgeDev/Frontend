import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  dialogPaper: {
    background: 'var(--bg, #fff)',
    color: 'var(--text, #000)',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    position: 'relative',
    padding: 0,
    maxHeight: 'calc(100vh - 2rem)',
    minWidth: '300px',
  },
  dialogContent: {
    padding: '1.5rem',
    paddingRight: '3.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  closeBtn: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    color: 'var(--muted-text, #666)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.05)',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  title: {
    fontWeight: 600,
  },
  subtitle: {
    color: 'text.secondary',
  },
  progressBarContainer: {
    width: '100%',
    height: '4px',
    background: 'rgba(0,0,0,0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  progressBar: (progress: number) => ({
    height: '100%',
    background: 'primary.main',
    width: `${progress}%`,
    transition: 'width 0.1s linear',
  }),
};
