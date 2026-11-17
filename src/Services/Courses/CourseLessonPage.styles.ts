import type { SxProps, Theme } from '@mui/material';

export const lessonPageSx: SxProps<Theme> = { display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', maxWidth: 1040, mx: 'auto' };
export const lessonHeaderSx: SxProps<Theme> = { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', alignItems: 'start', gap: 1.5 };
export const lessonBackSx: SxProps<Theme> = { minWidth: 44, minHeight: 44, color: 'var(--admin-muted)' };
export const lessonStatusSx: SxProps<Theme> = { display: 'flex', alignItems: 'center', gap: 2, py: 4 };
export const lessonTitleSx: SxProps<Theme> = { fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: 'text.primary', overflowWrap: 'anywhere' };
