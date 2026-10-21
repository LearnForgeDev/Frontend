export const styles = {
  avatar: { width: 32, height: 32, bgcolor: 'primary.dark' },
  identity: { flex: 1, minWidth: 0 },
  subtitle: { opacity: 0.8, display: 'block' },
  status: { height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.65rem' } },
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sender: { fontWeight: 700, display: 'block', mb: 0.5, opacity: 0.9 },
  time: { display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7, fontSize: '0.65rem' },
} as const;
