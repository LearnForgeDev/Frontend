import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    cursor: 'pointer',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'background.paper',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: 2,
    },
  },
  cardSelected: {
    borderColor: 'primary.main',
    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
  },
  thumbnail: {
    height: 110,
    width: '100%',
    background: 'linear-gradient(135deg, #2196F3 0%, #E0F7FA 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'primary.contrastText',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    p: 1.5,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  title: {
    fontWeight: 600,
    fontSize: '0.875rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    height: 38,
    lineHeight: '1.2rem',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mt: 'auto',
  },
  time: {
    fontSize: '0.75rem',
    color: 'text.secondary',
  },
  kebabButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    color: 'text.primary',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
  },
};
