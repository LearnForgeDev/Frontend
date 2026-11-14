import { DIALOG_MAX_WIDTH_SM, DIALOG_BORDER_RADIUS_PX } from './EventDetailModal.const';

export const styles = {
  dialogPaper: { position: 'relative', borderRadius: `${DIALOG_BORDER_RADIUS_PX}px`, maxWidth: DIALOG_MAX_WIDTH_SM, width: '100%', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, px: 2, py: 1, bgcolor: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
  actionButton: { width: 44, height: 44, color: 'var(--app-text-muted)', '&:hover': { color: 'primary.main', bgcolor: 'var(--app-primary-soft)' } },
  deleteButton: { width: 44, height: 44, color: 'var(--app-text-muted)', '&:hover': { color: 'error.main', bgcolor: 'action.hover' } },
  content: { p: 3 },
} as const;
