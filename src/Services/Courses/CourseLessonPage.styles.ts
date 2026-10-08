import type { SxProps, Theme } from '@mui/material';

export const lessonPageSx: SxProps<Theme> = { display: 'flex', flexDirection: 'column', gap: 3 };
export const lessonBackSx: SxProps<Theme> = { alignSelf: 'flex-start' };
export const lessonStatusSx: SxProps<Theme> = { display: 'flex', alignItems: 'center', gap: 2, py: 4 };
export const lessonTitleSx: SxProps<Theme> = { fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: 'text.primary' };
