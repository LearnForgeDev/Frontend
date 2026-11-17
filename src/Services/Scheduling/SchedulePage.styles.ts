export const styles = {
  root: { width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' },
  calendarFrame: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 160, minWidth: 0 },
  calendar: { flex: 1, minHeight: 0, overflow: 'auto' },
  loading: { flex: 1, minHeight: 0, borderRadius: 0 },
  list: { p: { xs: 2, sm: 3 } },
} as const;
