import { SLOT_HEIGHT_PX } from '@/Services/Scheduling/Scheduling.const';

export const styles = {
  weekRoot: {
    display: 'flex',
    backgroundColor: 'background.paper',
    overflow: 'auto',
  },
  hourRail: {
    flex: '0 0 56px',
    borderRight: '1px solid',
    borderColor: 'divider',
  },
  hourLabel: {
    height: SLOT_HEIGHT_PX,
    fontSize: '0.7rem',
    color: 'text.secondary',
    textAlign: 'right',
    pr: 0.5,
    pt: 0.25,
    boxSizing: 'border-box',
  },
  column: {
    flex: 1,
    minWidth: 120,
    borderRight: '1px solid',
    borderColor: 'divider',
    position: 'relative',
  },
  columnHeader: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderBottom: '1px solid',
    borderColor: 'divider',
    position: 'sticky',
    top: 0,
    bgcolor: 'background.paper',
    zIndex: 1,
  },
  columnBody: (heightPx: number) => ({
    position: 'relative',
    height: heightPx,
  }),
  slotLine: {
    height: SLOT_HEIGHT_PX,
    borderBottom: '1px dashed',
    borderColor: 'divider',
    boxSizing: 'border-box',
  },
  eventLayer: (topPx: number, heightPx: number) => ({
    position: 'absolute',
    top: topPx,
    left: 2,
    right: 2,
    height: heightPx,
  }),
  agendaRoot: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
  },
  agendaDay: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'text.secondary',
    mb: 0.5,
  },
} as const;
