import { MINI_CALENDAR_CELL_SIZE_PX } from './MiniCalendar.const';

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    p: 1.5,
    userSelect: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 1,
    px: 0.5,
  },
  monthTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'text.primary',
    textTransform: 'capitalize',
  },
  navControls: {
    display: 'flex',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: '1.1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    rowGap: 0.5,
    justifyItems: 'center',
  },
  weekday: {
    width: MINI_CALENDAR_CELL_SIZE_PX,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'text.secondary',
  },
  dayButton: (isCurrentMonth: boolean, isToday: boolean, isSelected: boolean) => ({
    width: MINI_CALENDAR_CELL_SIZE_PX,
    height: MINI_CALENDAR_CELL_SIZE_PX,
    borderRadius: '50%',
    minWidth: 'unset',
    p: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: isToday || isSelected ? 700 : 400,
    color: isSelected
      ? 'primary.contrastText'
      : isToday
      ? 'primary.main'
      : isCurrentMonth
      ? 'text.primary'
      : 'text.disabled',
    backgroundColor: isSelected
      ? 'primary.main'
      : 'transparent',
    border: isToday && !isSelected ? '1px solid' : '1px solid transparent',
    borderColor: isToday && !isSelected ? 'primary.main' : 'transparent',
    '&:hover': {
      backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
    },
    transition: 'background-color 150ms ease, border-color 150ms ease',
  }),
} as const;
