export const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    mt: 1,
    minWidth: { xs: 280, sm: 420 },
  },
  row: {
    display: 'flex',
    gap: 2,
    flexDirection: { xs: 'column', sm: 'row' },
  },
  studentsStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1,
    mt: 1,
  },
} as const;
