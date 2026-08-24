import type { Theme } from '@mui/material/styles';

const FULLSCREEN_HEADER_HOVER_STRIP = '8px';
const FULLSCREEN_HEADER_TRANSITION = 'transform 180ms ease, opacity 180ms ease';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: 'calc(100vh - 64px)',
    minHeight: 0,
    boxSizing: 'border-box',
    backgroundColor: (theme: Theme) => theme.palette.background.default,
    '&:fullscreen': {
      height: '100vh',
      backgroundColor: (theme: Theme) => theme.palette.background.default,
    },
  },
  emptyTitle: {
    fontWeight: 600,
  },
  emptyCard: {
    padding: (theme: Theme) => theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: (theme: Theme) => theme.spacing(1),
    boxShadow: (theme: Theme) => theme.shadows[3],
    borderRadius: (theme: Theme) => (theme.shape.borderRadius as number) * 2,
    background: (theme: Theme) => theme.palette.background.paper,
    maxWidth: '520px',
    margin: 'auto',
    textAlign: 'center',
  },
  errorCard: {
    padding: (theme: Theme) => theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: (theme: Theme) => theme.spacing(2),
    boxShadow: (theme: Theme) => theme.shadows[3],
    borderRadius: (theme: Theme) => (theme.shape.borderRadius as number) * 2,
    background: (theme: Theme) => theme.palette.background.paper,
    maxWidth: '550px',
    margin: '40px auto 0 auto',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 56,
  },
  errorActions: {
    display: 'flex',
    gap: (theme: Theme) => theme.spacing(2),
    marginTop: (theme: Theme) => theme.spacing(2),
  },
  callLayout: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: '100%',
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  callTitle: {
    fontWeight: 600,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  callActions: {
    display: 'flex',
    gap: (theme: Theme) => theme.spacing(1),
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  callHeaderBar: (isFullscreen: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: (theme: Theme) => theme.spacing(2),
    padding: (theme: Theme) => theme.spacing(1.5, 2),
    background: (theme: Theme) => theme.palette.background.paper,
    border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    borderBottom: 'none',
    flexShrink: 0,
    position: isFullscreen ? 'absolute' : 'relative',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    transform: isFullscreen ? `translateY(calc(-100% + ${FULLSCREEN_HEADER_HOVER_STRIP}))` : 'translateY(0)',
    opacity: isFullscreen ? 0.96 : 1,
    transition: FULLSCREEN_HEADER_TRANSITION,
    boxShadow: isFullscreen ? (theme: Theme) => theme.shadows[4] : 'none',
    ...(isFullscreen
      ? {
          '&:hover': {
            transform: 'translateY(0)',
            opacity: 1,
          },
        }
      : {}),
    '@media (max-width: 640px)': {
      alignItems: 'stretch',
      flexDirection: 'column',
    },
  }),
  jitsiContainer: {
    flexGrow: 1,
    width: '100%',
    minHeight: 0,
    overflow: 'hidden',
    border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    background: (theme: Theme) => theme.palette.common.black,
    '& iframe': {
      display: 'block',
      width: '100%',
      height: '100%',
    },
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: (theme: Theme) => theme.spacing(2),
    minHeight: '400px',
  },
};
