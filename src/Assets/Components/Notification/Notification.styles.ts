import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  alert: {
    minWidth: 260,
    maxWidth: 420,
    position: 'relative',
    overflow: 'hidden',
    mb: 1, // Margin bottom for stacking
  },
  title: {
    fontWeight: 600,
  },
  subtitle: {
    mt: 0.5,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '4px',
    width: '100%',
    background: 'rgba(255,255,255,0.2)',
  },
  progressBar: (progress: number) => ({
    height: '100%',
    background: 'rgba(255,255,255,0.8)',
    width: `${progress}%`,
    transition: 'width 0.1s linear',
  }),
};
