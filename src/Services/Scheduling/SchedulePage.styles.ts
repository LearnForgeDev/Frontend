export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: { xs: 1.5, md: 3 },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 1,
  },
  heading: {
    fontWeight: 700,
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '220px 1fr 300px' },
    gap: 2,
    alignItems: 'start',
  },
  left: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    p: 1,
    minHeight: 200,
  },
  railTitle: {
    px: 1,
    py: 0.5,
    fontWeight: 700,
    color: 'text.secondary',
  },
  center: {
    minWidth: 0,
  },
  right: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    minHeight: 200,
  },
  empty: {
    p: 4,
    textAlign: 'center',
  },
} as const;
