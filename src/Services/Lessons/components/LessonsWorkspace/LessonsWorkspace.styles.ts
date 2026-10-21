export const styles = {
  root: { display: 'flex', flexDirection: 'column', height: '100%', p: 3 },
  header: { mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 },
  title: { fontWeight: 700 },
  content: { flexGrow: 1, height: '100%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 },
  skeleton: { borderRadius: 2 },
} as const;
