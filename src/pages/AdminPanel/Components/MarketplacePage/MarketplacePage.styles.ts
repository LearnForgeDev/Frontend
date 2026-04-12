export const marketplacePageStyles = {
  '.admin-marketplace-hero': {
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--admin-surface-low)',
    padding: '3rem',
    borderRadius: '2rem',
    border: 'none',
  },
  '.admin-marketplace-hero-content': {
    position: 'relative',
    zIndex: 2,
    maxWidth: '700px',
  },
  '.admin-marketplace-pill': {
    display: 'inline-block',
    marginBottom: '1rem',
    padding: '0.35rem 0.7rem',
    borderRadius: '999px',
    background: 'var(--admin-secondary-soft)',
    color: '#37593d',
    fontSize: '0.66rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  '.admin-marketplace-hero .admin-page-title': {
    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
    marginBottom: '1rem',
  },
  '.admin-marketplace-hero .admin-page-title span': {
    color: 'var(--admin-primary)',
  },
  '.admin-marketplace-hero-orbit': {
    position: 'absolute',
    top: '-150px',
    right: '-60px',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    border: '2px dashed rgba(73, 88, 172, 0.24)',
    boxShadow:
      'inset 0 0 0 30px rgba(73, 88, 172, 0.06), inset 0 0 0 90px rgba(73, 88, 172, 0.03)',
  },
  '.admin-marketplace-grid': {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '1.25rem',
  },
  '.admin-marketplace-card': {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '390px',
    transition: 'border-color 0.2s ease',
  },
  '.admin-marketplace-card.skeleton': {
    position: 'relative',
    isolation: 'isolate',
    overflow: 'hidden',
    borderRadius: '1.25rem',
    border: '1px solid var(--admin-border)',
    background:
      'linear-gradient(110deg, rgba(150, 165, 255, 0.12) 10%, rgba(150, 165, 255, 0.22) 45%, rgba(150, 165, 255, 0.12) 80%)',
    backgroundSize: '220% 100%',
  },
  '.admin-marketplace-card.skeleton::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%)',
    transform: 'translateX(-100%)',
    animation: 'admin-marketplace-shimmer 1.35s infinite ease-in-out',
  },
  '.admin-marketplace-card.inactive': {
    borderColor: 'color-mix(in srgb, var(--admin-border) 78%, #8e949f 22%)',
  },
  '.admin-marketplace-card-body': {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1.5rem',
  },
  '.admin-marketplace-card-header': {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  '.admin-marketplace-icon-box': {
    width: '56px',
    height: '56px',
    borderRadius: '1rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(150, 165, 255, 0.2)',
    color: 'var(--admin-primary)',
  },
  '.admin-marketplace-card.inactive .admin-marketplace-icon-box': {
    background: 'color-mix(in srgb, var(--admin-surface-low) 86%, #8f96a3 14%)',
    color: '#8f96a3',
  },
  '.admin-marketplace-icon-box .material-symbols-outlined': {
    fontSize: '32px',
  },
  '.admin-marketplace-card.inactive .admin-marketplace-icon-box .material-symbols-outlined': {
    color: '#8f96a3',
  },
  '.admin-marketplace-card-title': {
    margin: '0 0 0.55rem',
    fontSize: '1.3rem',
    fontFamily: "'Manrope', sans-serif",
    fontWeight: 800,
  },
  '.admin-marketplace-card-desc': {
    margin: 0,
    color: 'var(--admin-muted)',
    lineHeight: 1.55,
    fontSize: '0.92rem',
  },
  '.admin-marketplace-card.inactive .admin-marketplace-card-title, .admin-marketplace-card.inactive .admin-marketplace-card-desc, .admin-marketplace-card.inactive .admin-marketplace-price': {
    color: 'color-mix(in srgb, var(--admin-muted) 88%, #8f96a3 12%)',
  },
  '.admin-marketplace-card.inactive .admin-chip': {
    background: 'color-mix(in srgb, var(--admin-surface-low) 84%, #8f96a3 16%)',
    color: '#6b7280',
  },
  '.admin-marketplace-card.selected': {
    border: '2px solid var(--admin-primary)',
    boxShadow: '0 0 0 1px color-mix(in srgb, var(--admin-primary) 35%, transparent)',
  },
  '.admin-marketplace-feature-list': {
    margin: '1.2rem 0 0',
    padding: 0,
    listStyle: 'none',
    display: 'grid',
    gap: '0.7rem',
  },
  '.admin-marketplace-feature-item': {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.88rem',
    color: 'color-mix(in srgb, var(--admin-text) 82%, transparent)',
  },
  '.admin-marketplace-feature-item .material-symbols-outlined': {
    fontSize: '18px',
    color: 'var(--admin-secondary)',
  },
  '.admin-marketplace-card.inactive .admin-marketplace-feature-item, .admin-marketplace-card.inactive .admin-marketplace-feature-item .material-symbols-outlined': {
    color: '#9ca3af',
  },
  '.admin-marketplace-card-footer': {
    marginTop: 'auto',
    padding: '1.1rem 1.5rem 1.35rem',
    borderTop: '1px solid var(--admin-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  '.admin-marketplace-price-free, .admin-marketplace-price': {
    fontSize: '1.25rem',
    fontFamily: "'Manrope', sans-serif",
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  '.admin-marketplace-price::after': {
    content: '" ₽/мес"',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    color: 'var(--admin-muted)',
  },
  '.admin-marketplace-coming-soon': {
    borderRadius: '1.5rem',
    border: '1px dashed var(--admin-outline)',
    background: 'rgba(244, 244, 240, 0.7)',
    minHeight: '390px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '1.8rem',
  },
  '.admin-marketplace-coming-soon-icon': {
    width: '64px',
    height: '64px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--admin-surface-container)',
    color: 'var(--admin-muted)',
  },
  '.admin-marketplace-coming-soon h3': {
    margin: '0.9rem 0 0.3rem',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '1.12rem',
  },
  '.admin-marketplace-coming-soon p': {
    margin: 0,
    color: 'var(--admin-muted)',
    maxWidth: '220px',
  },
  '.admin-marketplace-coming-soon .admin-button': {
    marginTop: '1rem',
  },
  '.admin-marketplace-billing': {
    background: '#0d0f0d',
    color: '#faf8ff',
    borderRadius: '2rem',
    padding: '1.7rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  '.admin-marketplace-billing h3': {
    margin: 0,
    fontFamily: "'Manrope', sans-serif",
    fontSize: '1.3rem',
  },
  '.admin-marketplace-billing-row': {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    fontSize: '0.9rem',
    color: 'rgba(250, 248, 255, 0.82)',
    marginTop: '0.5rem',
  },
  '.admin-marketplace-billing-row span:last-child::after': {
    content: '"₽"',
    color: 'var(--admin-muted)',
    fontSize: '0.75rem',
  },
  '.admin-marketplace-billing-row.new span': {
    color: 'var(--admin-success)',
  },
  '.admin-marketplace-billing-total': {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  '.admin-marketplace-billing-total span': {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: '0.68rem',
    color: 'rgba(250, 248, 255, 0.6)',
    height: '50%',
  },
  '.admin-marketplace-billing-total strong': {
    fontSize: '2rem',
    fontFamily: "'Manrope', sans-serif",
  },
  '.admin-marketplace-billing .admin-button.primary': {
    marginTop: '0.4rem',
    width: '100%',
    border: 'none',
    background: 'linear-gradient(135deg, #4958ac 0%, #96a5ff 100%)',
  },
  '.admin-marketplace-upgrade': {
    marginTop: '1.25rem',
    padding: '2.2rem',
    display: 'grid',
    gridTemplateColumns: '1fr minmax(220px, 35%)',
    gap: '1.25rem',
    background: 'rgba(73, 88, 172, 0.05)',
    border: 'none',
  },
  '.admin-marketplace-upgrade .admin-widget-title': {
    marginBottom: '0.7rem',
    fontSize: '1.5rem',
    fontFamily: "'Manrope', sans-serif",
    fontWeight: 800,
  },
  '.admin-marketplace-upgrade p': {
    margin: 0,
    color: 'var(--admin-muted)',
    lineHeight: 1.55,
  },
  '.admin-marketplace-upgrade .admin-button': {
    marginTop: '1rem',
  },
  '.admin-marketplace-upgrade .admin-button.ghost': {
    boxSizing: 'border-box',
    padding: 0,
    textDecoration: 'none',
    fontSize: '1rem',
  },
  '.admin-marketplace-upgrade-media': {
    borderRadius: '1.2rem',
    minHeight: '210px',
    background: 'radial-gradient(circle at 30% 15%, #96a5ff 0%, #4958ac 35%, #242b56 100%)',
    position: 'relative',
  },
  '.admin-marketplace-upgrade-media::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '1.2rem',
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.35), transparent)',
  },
  '.admin-button.ghost': {
    boxSizing: 'border-box',
    padding: 0,
    textDecoration: 'none',
    fontSize: '1rem',
  },
  '@keyframes admin-marketplace-shimmer': {
    '0%': {
      transform: 'translateX(-100%)',
    },
    '100%': {
      transform: 'translateX(100%)',
    },
  },
  '@media (max-width:1260px)': {
    '.admin-marketplace-grid': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  '@media (max-width:980px)': {
    '.admin-marketplace-grid': {
      gridTemplateColumns: '1fr',
    },
    '.admin-marketplace-hero': {
      padding: '1.7rem',
    },
    '.admin-marketplace-hero-orbit': {
      display: 'none',
    },
    '.admin-marketplace-upgrade': {
      gridTemplateColumns: '1fr',
      padding: '1.5rem',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '.admin-marketplace-card.skeleton::before': {
      animation: 'none',
      transform: 'translateX(0)',
    },
  },
};


