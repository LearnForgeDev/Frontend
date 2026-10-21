export const styles = {
  loading: { display: 'flex', justifyContent: 'center', p: 4 },
  error: { p: 2 },
  empty: { p: 4, textAlign: 'center' },
  avatar: (selected: boolean) => ({ bgcolor: selected ? 'primary.main' : 'primary.light' }),
  name: (selected: boolean) => ({ fontWeight: selected ? 600 : 500 }),
} as const;
