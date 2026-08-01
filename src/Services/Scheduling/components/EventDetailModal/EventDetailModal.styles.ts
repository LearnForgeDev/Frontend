import { EVENT_COLOR } from '@/Services/Scheduling/Scheduling.const';
import {
  DIALOG_MAX_WIDTH_SM,
  DIALOG_BORDER_RADIUS_PX,
  HEADER_TOP_BORDER_PX,
} from './EventDetailModal.const';

export const styles = {
  dialogPaper: {
    position: 'relative',
    borderRadius: `${DIALOG_BORDER_RADIUS_PX}px`,
    maxWidth: DIALOG_MAX_WIDTH_SM,
    width: '100%',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.5,
    px: 2,
    py: 1,
    borderTop: `${HEADER_TOP_BORDER_PX}px solid ${EVENT_COLOR}`,
    backgroundColor: 'rgba(73, 104, 242, 0.04)',
    borderBottom: '1px solid',
    borderBottomColor: 'divider',
  },
  actionButton: {
    color: 'text.secondary',
    transition: 'all 0.15s ease',
    '&:hover': {
      color: 'primary.main',
      backgroundColor: 'rgba(73, 104, 242, 0.08)',
    },
  },
  deleteButton: {
    color: 'text.secondary',
    transition: 'all 0.15s ease',
    '&:hover': {
      color: 'error.main',
      backgroundColor: 'rgba(211, 47, 47, 0.08)',
    },
  },
  content: {
    p: 3,
  },
} as const;
