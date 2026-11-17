export const styles = {
  root: { display: 'flex', flexDirection: 'column', height: '100%' },
  back: { mr: 1, width: 44, height: 44, borderRadius: '50%', border: '1px solid', borderColor: 'divider', flexShrink: 0 },
  avatar: { bgcolor: 'primary.dark' },
  subtitle: { display: 'block' },
  status: { fontWeight: 500 },
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' },
} as const;
