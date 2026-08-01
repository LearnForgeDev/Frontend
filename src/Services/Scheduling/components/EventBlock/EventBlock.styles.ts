import { EVENT_COLOR } from '@/Services/Scheduling/Scheduling.const';
import { EVENT_BORDER_LEFT_WIDTH_PX } from './EventBlock.const';

export const styles = {
  root: (selected: boolean, height?: number) => ({
    backgroundColor: selected ? 'rgba(73, 104, 242, 0.25)' : 'rgba(73, 104, 242, 0.14)',
    color: 'text.primary',
    borderRadius: '4px',
    borderLeft: `${EVENT_BORDER_LEFT_WIDTH_PX}px solid`,
    borderLeftColor: EVENT_COLOR,
    px: 1,
    py: 0.5,
    cursor: 'pointer',
    overflow: 'hidden',
    height,
    boxShadow: selected
      ? '0 2px 6px rgba(0, 0, 0, 0.15), 0 0 0 2px ' + EVENT_COLOR
      : '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease',
    '&:hover': {
      backgroundColor: 'rgba(73, 104, 242, 0.22)',
      transform: 'scale(1.01)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
      zIndex: 2,
    },
  }),
  time: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'primary.main',
    lineHeight: 1.2,
    mb: 0.25,
  },
  title: {
    fontSize: '0.8rem',
    fontWeight: 700,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    color: 'text.primary',
  },
} as const;
