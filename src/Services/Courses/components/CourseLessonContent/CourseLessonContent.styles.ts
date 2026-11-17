import type { SxProps, Theme } from '@mui/material';

export const lessonContentSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  width: '100%',
  bgcolor: 'var(--admin-surface)',
  overflowWrap: 'anywhere',
  '& .editor-input': { flex: 1, minHeight: 0, width: '100%', boxSizing: 'border-box', overflow: 'auto', border: 0, borderRadius: 0, p: { xs: 2, md: 3 }, outline: 'none' },
  '& .resize-handle': { display: 'none' },
  '& img, & iframe': { maxWidth: '100%' },
};
