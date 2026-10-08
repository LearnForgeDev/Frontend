import type { SxProps, Theme } from '@mui/material';

export const lessonContentSx: SxProps<Theme> = {
  p: { xs: 2, md: 4 },
  borderRadius: 3,
  bgcolor: 'var(--admin-surface)',
  border: '1px solid var(--admin-border)',
  overflowWrap: 'anywhere',
  '& .editor-input': { minHeight: 0, outline: 'none' },
  '& .resize-handle': { display: 'none' },
  '& img, & iframe': { maxWidth: '100%' },
};
