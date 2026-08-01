import { EVENT_COLOR } from '@/Services/Scheduling/Scheduling.const';
import {
  ICON_COLUMN_WIDTH_PX,
  COLOR_DOT_SIZE_PX,
  COLOR_DOT_RADIUS_PX,
  TITLE_INPUT_LINE_HEIGHT,
} from './EventDetailPanel.const';

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
  },
  iconColumn: {
    width: `${ICON_COLUMN_WIDTH_PX}px`,
    minWidth: `${ICON_COLUMN_WIDTH_PX}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pt: 0.25,
  },
  contentColumn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },
  colorDot: {
    width: `${COLOR_DOT_SIZE_PX}px`,
    height: `${COLOR_DOT_SIZE_PX}px`,
    borderRadius: `${COLOR_DOT_RADIUS_PX}px`,
    backgroundColor: EVENT_COLOR,
    mt: 0.5,
  },
  rowIcon: {
    color: 'text.secondary',
    fontSize: '1.25rem',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    width: 'fit-content',
    cursor: 'pointer',
    '&:hover .edit-title-icon': {
      opacity: 1,
      color: 'primary.main',
    },
  },
  title: {
    fontWeight: 700,
    lineHeight: 1.3,
    color: 'text.primary',
    wordBreak: 'break-word',
  },
  editableTitle: {
    '&:hover': {
      textDecoration: 'underline',
      textDecorationStyle: 'dotted',
      textUnderlineOffset: 4,
    },
  },
  editTitleIcon: {
    fontSize: '1.1rem',
    color: 'text.secondary',
    opacity: 0.4,
    transition: 'all 0.15s ease',
  },
  titleInput: {
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: TITLE_INPUT_LINE_HEIGHT,
  },
  time: {
    fontWeight: 500,
    color: 'text.secondary',
  },
  description: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
    color: 'text.primary',
  },
} as const;
