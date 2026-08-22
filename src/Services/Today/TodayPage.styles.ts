import type { SxProps, Theme } from '@mui/material';

export const pageSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: 1180,
  mx: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 2.5, md: 3 },
};

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: { xs: 'flex-start', md: 'center' },
  justifyContent: 'space-between',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2,
};

export const titleSx: SxProps<Theme> = {
  color: 'var(--admin-text)',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: { xs: '2rem', md: '2.5rem' },
  letterSpacing: '-0.04em',
};

export const dateSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  mt: 0.5,
};

export const actionsSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 1,
};

export const primaryActionSx: SxProps<Theme> = {
  borderRadius: 3,
  textTransform: 'none',
  fontWeight: 700,
  px: 2,
};

export const secondaryActionSx: SxProps<Theme> = {
  ...primaryActionSx,
  color: 'var(--admin-text)',
  borderColor: 'var(--admin-border)',
};

export const heroSx: SxProps<Theme> = {
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  justifyContent: 'space-between',
  gap: 3,
  p: { xs: 2.5, md: 4 },
  borderRadius: 4,
  color: '#fff',
  background:
    'linear-gradient(135deg, var(--admin-primary) 0%, #6476d8 58%, #8b9bea 100%)',
  boxShadow: '0 24px 56px rgba(73, 88, 172, 0.2)',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 260,
    height: 260,
    right: -90,
    top: -130,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.12)',
  },
};

export const heroContentSx: SxProps<Theme> = {
  position: 'relative',
  zIndex: 1,
  minWidth: 0,
};

export const eyebrowSx: SxProps<Theme> = {
  color: 'rgba(255, 255, 255, 0.78)',
  fontSize: '0.75rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
};

export const heroTitleSx: SxProps<Theme> = {
  mt: 1,
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: { xs: '1.5rem', md: '2rem' },
};

export const heroMetaSx: SxProps<Theme> = {
  mt: 1,
  color: 'rgba(255, 255, 255, 0.88)',
};

export const heroActionsSx: SxProps<Theme> = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: { xs: 'stretch', md: 'flex-end' },
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 1,
  minWidth: { md: 190 },
  '& .MuiButton-root': {
    width: '100%',
  },
};

export const heroSecondaryButtonSx: SxProps<Theme> = {
  color: '#fff',
  borderColor: 'rgba(255, 255, 255, 0.45)',
  textTransform: 'none',
  fontWeight: 700,
  '&:hover': {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
};

export const contentGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)' },
  gap: 2,
};

export const schoolSummarySx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  px: { xs: 2, md: 2.5 },
  py: 2,
  border: '1px solid var(--admin-border)',
  borderRadius: 3,
  backgroundColor: 'var(--admin-surface)',
  boxShadow: 'var(--admin-shadow)',
};

export const schoolSummaryHeadingSx: SxProps<Theme> = {
  color: 'var(--admin-text)',
  fontWeight: 800,
};

export const schoolSummaryMetricSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 1,
};

export const schoolSummaryValueSx: SxProps<Theme> = {
  color: 'var(--admin-primary)',
  fontFamily: 'Manrope, sans-serif',
  fontSize: '1.5rem',
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
};

export const schoolSummaryLabelSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  fontSize: '0.9rem',
};

export const sectionSx: SxProps<Theme> = {
  p: { xs: 2, md: 2.5 },
  border: '1px solid var(--admin-border)',
  borderRadius: 3,
  backgroundColor: 'var(--admin-surface)',
  boxShadow: 'var(--admin-shadow)',
};

export const sectionHeaderSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  mb: 1.5,
};

export const sectionTitleSx: SxProps<Theme> = {
  color: 'var(--admin-text)',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: '1.05rem',
};

export const textActionSx: SxProps<Theme> = {
  flexShrink: 0,
  textTransform: 'none',
  fontWeight: 700,
};

export const listSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
};

export const scheduleRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  py: 1.5,
  borderTop: '1px solid var(--admin-border)',
  '&:first-of-type': {
    borderTop: 0,
  },
};

export const timeSx: SxProps<Theme> = {
  minWidth: 96,
  color: 'var(--admin-primary)',
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
};

export const itemTextSx: SxProps<Theme> = {
  minWidth: 0,
  flex: 1,
};

export const itemTitleSx: SxProps<Theme> = {
  color: 'var(--admin-text)',
  fontWeight: 700,
};

export const itemDescriptionSx: SxProps<Theme> = {
  color: 'var(--admin-muted)',
  fontSize: '0.82rem',
  mt: 0.25,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export const lessonButtonSx: SxProps<Theme> = {
  justifyContent: 'flex-start',
  width: '100%',
  py: 1.5,
  px: 1,
  borderTop: '1px solid var(--admin-border)',
  borderRadius: 0,
  color: 'var(--admin-text)',
  textAlign: 'left',
  textTransform: 'none',
  '&:first-of-type': {
    borderTop: 0,
  },
};

export const stateSx: SxProps<Theme> = {
  minHeight: 112,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--admin-muted)',
  textAlign: 'center',
};
