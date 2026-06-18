import { EVENT_COLOR } from '@/Services/Scheduling/Scheduling.const';

export const styles = {
  root: (selected: boolean) => ({
    backgroundColor: EVENT_COLOR,
    color: '#fff',
    borderRadius: 1,
    px: 1,
    py: 0.5,
    cursor: 'pointer',
    overflow: 'hidden',
    boxShadow: selected ? '0 0 0 2px #fff, 0 0 0 4px ' + EVENT_COLOR : 'none',
    transition: 'box-shadow 120ms ease',
  }),
  time: {
    fontSize: '0.7rem',
    opacity: 0.85,
    lineHeight: 1.2,
  },
  title: {
    fontSize: '0.8rem',
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
} as const;
