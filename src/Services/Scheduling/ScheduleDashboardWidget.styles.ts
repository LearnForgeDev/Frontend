export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    p: 2,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Manrope, sans-serif',
    fontWeight: 700,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    pt: 1,
  },
  rowText: {
    minWidth: 0,
  },
  eventTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  eventTime: {
    fontSize: '0.72rem',
    color: 'text.secondary',
  },
} as const;
