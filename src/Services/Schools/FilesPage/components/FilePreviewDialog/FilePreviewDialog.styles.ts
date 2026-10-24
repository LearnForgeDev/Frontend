import type { SxProps, Theme } from '@mui/material';

export const title: SxProps<Theme> = { overflowWrap: 'anywhere' };
export const content: SxProps<Theme> = { minHeight: 200 };
export const feedback: SxProps<Theme> = { display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, py: 4 };
export const text: SxProps<Theme> = { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', bgcolor: 'action.hover', p: 2, borderRadius: 1, maxHeight: 400, overflowY: 'auto' };
export const media: SxProps<Theme> = { position: 'relative', minHeight: 200 };
export const image: SxProps<Theme> = { display: 'block', maxWidth: '100%', maxHeight: 450, objectFit: 'contain', mx: 'auto' };
export const pdf: SxProps<Theme> = { display: 'block', border: 0, width: '100%', height: 500 };
