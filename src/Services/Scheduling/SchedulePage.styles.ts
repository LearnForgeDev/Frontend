import { SKELETON_HEIGHT_PX } from './SchedulePage.const';

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: { xs: 'calc(100vh - 5rem)', md: 'calc(100vh - 88px)' },
    maxHeight: { xs: 'calc(100vh - 5rem)', md: 'calc(100vh - 88px)' },
    overflow: 'hidden',
    bgcolor: 'background.default',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    height: '100%',
  },
  sidebarColumn: {
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    borderRight: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    overflowY: 'auto',
    height: '100%',
    minHeight: 0,
  },
  mainColumn: {
    minWidth: 0,
    backgroundColor: 'background.paper',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  skeletonSidebar: {
    display: { xs: 'none', md: 'block' },
    height: SKELETON_HEIGHT_PX,
    m: 2,
  },
  skeletonMain: {
    height: SKELETON_HEIGHT_PX,
    m: 2,
    flex: 1,
  },
  empty: {
    p: 4,
    textAlign: 'center',
  },
} as const;
