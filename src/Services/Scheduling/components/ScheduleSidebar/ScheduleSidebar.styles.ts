import { CREATE_BUTTON_BORDER_RADIUS_PX } from './ScheduleSidebar.const';

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
    overflow: 'hidden',
  },
  createButtonWrapper: {
    px: 1,
    pt: 0.5,
  },
  createButton: {
    borderRadius: CREATE_BUTTON_BORDER_RADIUS_PX,
    px: 2.5,
    py: 1.2,
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.2)',
      transform: 'translateY(-1px)',
    },
  },
  sectionDivider: {
    mx: 1.5,
    borderColor: 'divider',
  },
  upcomingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    px: 0.5,
  },
  upcomingTitle: {
    px: 1,
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'text.secondary',
    letterSpacing: '0.05em',
  },
} as const;
