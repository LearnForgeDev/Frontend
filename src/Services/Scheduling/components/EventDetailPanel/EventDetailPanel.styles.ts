export const styles = {
  root: {
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
  },
  title: {
    fontWeight: 700,
  },
  time: {},
  description: {
    mt: 0.5,
  },
  divider: {
    my: 1,
  },
  attendees: {
    mt: 0.5,
    mb: 1,
  },
  actions: {
    mt: 'auto',
    display: 'flex',
    gap: 1,
  },
} as const;
