import type { SxProps, Theme } from '@mui/material';
import { FILE_MANAGER_CONSTANTS } from './FileManager.const';

export const styles: Record<string, SxProps<Theme>> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    gap: 2,
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${FILE_MANAGER_CONSTANTS.LESSON_CARD_WIDTH}px, 1fr))`,
    gap: '16px',
    py: 2,
  },
  contentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    py: 2,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    textAlign: 'center',
    gap: 2,
    p: 3,
  },
  emptyIcon: {
    fontSize: '5rem',
    color: 'text.secondary',
    opacity: 0.5,
  },
  errorAlert: {
    width: '100%',
    my: 2,
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 1,
  },
  modalTitle: {
    fontWeight: 600,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1.5,
    marginTop: 2,
  },
};
