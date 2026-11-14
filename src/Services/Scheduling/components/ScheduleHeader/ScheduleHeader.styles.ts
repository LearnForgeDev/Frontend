export const styles = {
  root: { display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  headingRow: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'stretch', sm: 'center' },
    justifyContent: 'space-between',
    gap: 2,
  },
  createButton: { flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 2, minWidth: 0,
  },
  navigation: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, minWidth: 0 },
  navControls: { display: 'flex', alignItems: 'center', gap: 1 },
  arrowButton: { width: 44, height: 44 },
  period: { fontSize: '1.2rem', fontWeight: 800, overflowWrap: 'anywhere' },
} as const;
