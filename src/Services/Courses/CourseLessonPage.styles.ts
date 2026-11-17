import type { SxProps, Theme } from '@mui/material';

export const lessonPageSx: SxProps<Theme> = { display: 'flex', flexDirection: 'column', gap: 0, flex: 1, width: '100%', height: '100%', minHeight: 0, minWidth: 0, overflow: 'hidden', '& > header': { flexShrink: 0, p: 2 } };
export const lessonHeaderSx: SxProps<Theme> = { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', alignItems: 'start', gap: 1.5 };
export const lessonBackSx: SxProps<Theme> = { width: 44, height: 44, borderRadius: '50%', border: '1px solid', borderColor: 'divider', color: 'var(--admin-muted)' };
export const lessonStatusSx: SxProps<Theme> = { display: 'flex', alignItems: 'center', gap: 2, py: 4 };
export const lessonTitleSx: SxProps<Theme> = { fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: 'text.primary', overflowWrap: 'anywhere' };
