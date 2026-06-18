import type { Theme } from '@mui/material/styles';

export const styles = {
  container: {
    padding: (theme: Theme) => theme.spacing(3),
    height: 'calc(100vh - 100px)',
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  chatLayout: {
    display: 'flex',
    flexGrow: 1,
    backgroundColor: (theme: Theme) => theme.palette.background.paper,
    borderRadius: (theme: Theme) => theme.shape.borderRadius,
    border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    height: '100%',
  },
  sidebarHeader: {
    padding: (theme: Theme) => theme.spacing(2),
    borderBottom: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontWeight: 700,
  },
  tabsContainer: {
    borderBottom: (theme: Theme) => `1px solid ${theme.palette.divider}`,
  },
  chatList: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: 0,
  },
  chatItem: {
    borderBottom: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  chatArea: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: (theme: Theme) => theme.palette.action.hover + '22',
  },
  chatHeader: {
    padding: (theme: Theme) => theme.spacing(2),
    borderBottom: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    backgroundColor: (theme: Theme) => theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    gap: (theme: Theme) => theme.spacing(2),
  },
  chatHeaderTitle: {
    fontWeight: 600,
  },
  messagesArea: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: (theme: Theme) => theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: (theme: Theme) => theme.spacing(1.5),
  },
  messageBubbleContainer: (isOwn: boolean) => ({
    display: 'flex',
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
    width: '100%',
  }),
  messageBubble: (isOwn: boolean) => ({
    maxWidth: '70%',
    padding: (theme: Theme) => theme.spacing(1.5, 2),
    borderRadius: (theme: Theme) => {
      const radius = theme.shape.borderRadius as number;
      return isOwn
        ? `${radius * 2.5}px ${radius * 2.5}px 4px ${radius * 2.5}px`
        : `${radius * 2.5}px ${radius * 2.5}px ${radius * 2.5}px 4px`;
    },
    backgroundColor: (theme: Theme) =>
      isOwn ? theme.palette.primary.main : theme.palette.background.paper,
    color: (theme: Theme) =>
      isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
    boxShadow: (theme: Theme) => theme.shadows[1],
    position: 'relative',
  }),
  messageSender: {
    fontWeight: 700,
    fontSize: '0.75rem',
    marginBottom: '4px',
    display: 'block',
  },
  messageTime: {
    fontSize: '0.65rem',
    display: 'block',
    textAlign: 'right',
    marginTop: '4px',
    opacity: 0.7,
  },
  inputArea: {
    padding: (theme: Theme) => theme.spacing(2),
    borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}`,
    backgroundColor: (theme: Theme) => theme.palette.background.paper,
  },
  placeholderArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: (theme: Theme) => theme.palette.text.secondary,
    padding: (theme: Theme) => theme.spacing(4),
    textAlign: 'center',
    gap: (theme: Theme) => theme.spacing(2),
  },
};
