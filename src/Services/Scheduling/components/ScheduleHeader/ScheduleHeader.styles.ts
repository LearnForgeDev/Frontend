export const styles = {
  root: { display: 'flex', flexDirection: 'column', flexShrink: 0, gap: 1.5, p: 2, minWidth: 0, borderBottom: '1px solid var(--app-border)' },
  headingRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
  title: { fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: { xs: '1.3rem', sm: '2rem' }, letterSpacing: '-0.025em', color: 'var(--admin-text)' },
  subtitle: { display: { xs: 'none', sm: 'block' }, color: 'var(--admin-muted)' },
  createButton: { flexShrink: 0, minWidth: { xs: 44, sm: 'auto' }, minHeight: 44, px: { xs: 0, sm: 2 }, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } } },
  createLabel: { display: { xs: 'none', sm: 'inline' } },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 2, minWidth: 0,
  },
  navigation: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, minWidth: 0 },
  navControls: { display: 'flex', alignItems: 'center', gap: 1 },
  arrowButton: { width: 44, height: 44 },
  period: { fontSize: '1.2rem', fontWeight: 800, overflowWrap: 'anywhere' },
} as const;
