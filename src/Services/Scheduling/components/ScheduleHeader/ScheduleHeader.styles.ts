export const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 2,
    py: 1,
    px: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
  },
  heading: {
    fontWeight: 700,
    fontSize: { xs: '1.25rem', sm: '1.5rem' },
    color: 'text.primary',
    mr: 1,
  },
  navControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },
  todayButton: {
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 1.5,
    px: 2,
    py: 0.5,
  },
  monthYearTitle: {
    fontSize: { xs: '1rem', sm: '1.2rem' },
    fontWeight: 600,
    color: 'text.primary',
    minWidth: { sm: 220 },
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },
} as const;
