export const adminPanelCommonStyles = {
  body: {
    background: 'var(--admin-bg)',
    color: 'var(--admin-text)',
    fontFamily: "'Inter', sans-serif",
  },
  '.admin-page': {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  '.admin-page-header': {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  '.admin-page-title': {
    margin: 0,
    color: 'var(--admin-text)',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '1.9rem',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  '.admin-page-description': {
    margin: '0.35rem 0 0',
    color: 'var(--admin-muted)',
    maxWidth: '680px',
  },
  '.admin-card': {
    background: 'var(--admin-surface)',
    border: '1px solid var(--admin-border)',
    borderRadius: '1.5rem',
    boxShadow: 'var(--admin-shadow)',
  },
  '.admin-chip': {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.65rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    border: '1px solid transparent',
  },
  '.admin-chip.active': {
    color: 'var(--admin-secondary)',
    background: 'rgba(197, 237, 199, 0.35)',
  },
  '.admin-chip.inactive': {
    color: 'var(--admin-muted)',
    background: 'var(--admin-surface-container)',
  },
  '.admin-chip.configuring': {
    color: '#8b6a1b',
    background: '#f9efd2',
  },
  '.admin-chip.error': {
    color: 'var(--admin-danger)',
    background: '#fbd8df',
  },
  '.admin-chip.beta': {
    color: '#4f5863',
    background: '#e8eaf6',
  },
  '.admin-button': {
    border: '1px solid var(--admin-border)',
    background: 'var(--admin-surface)',
    color: 'var(--admin-text)',
    fontWeight: 700,
    borderRadius: '0.7rem',
    fontSize: '0.85rem',
    fontFamily: "'Manrope', sans-serif",
    padding: '0.6rem 0.9rem',
    cursor: 'pointer',
  },
  '.admin-button.primary': {
    borderColor: 'var(--admin-primary)',
    background: 'var(--admin-primary)',
    color: '#fff',
  },
  '.admin-button.ghost': {
    background: 'transparent',
    borderColor: 'transparent',
    color: 'var(--admin-primary)',
  },
  '.admin-button:hover': {
    filter: 'brightness(0.96)',
  },
  '.admin-empty-state': {
    border: '1px dashed var(--admin-outline)',
    borderRadius: '1.5rem',
    background: 'var(--admin-surface)',
    padding: '1.75rem',
    color: 'var(--admin-muted)',
  },
  '.service-config-wrapper': {
    padding: '1.5rem',
  },
  '.service-config-wrapper h2': {
    marginTop: 0,
    marginBottom: '1rem',
    color: 'var(--admin-text)',
  },
};


