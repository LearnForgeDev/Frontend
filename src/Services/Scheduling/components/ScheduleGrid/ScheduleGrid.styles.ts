import { SLOT_HEIGHT_PX } from '../../Scheduling.const';
import { COLUMN_HEADER_HEIGHT_PX } from './ScheduleGrid.const';

export const styles = {
  weekRoot: { display: 'flex', alignItems: 'flex-start', overflow: 'auto', width: '100%', height: COLUMN_HEADER_HEIGHT_PX + 8 * SLOT_HEIGHT_PX, position: 'relative', '&:focus-visible': { outline: '3px solid var(--app-focus)', outlineOffset: -3 } },
  hourRail: { flex: '0 0 60px', userSelect: 'none' },
  hourRailSpacer: { height: COLUMN_HEADER_HEIGHT_PX, borderBottom: '1px solid var(--app-border)', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-text-muted)', fontSize: '0.75rem' },
  hourLabel: { height: SLOT_HEIGHT_PX, fontSize: '0.75rem', fontWeight: 500, color: 'var(--app-text-muted)', textAlign: 'right', pr: 1, pt: 0.5, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' },
  column: { flex: 1, minWidth: 0, borderLeft: '1px solid var(--app-border)', position: 'relative' },
  columnHeader: (today: boolean) => ({ height: COLUMN_HEADER_HEIGHT_PX, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5, borderBottom: '1px solid var(--app-border)', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 2, color: today ? 'primary.main' : 'var(--app-text-muted)' }),
  headerWeekday: { fontSize: '0.875rem', fontWeight: 400 },
  headerDayNumber: (today: boolean) => ({ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1, color: today ? 'primary.main' : 'text.primary' }),
  columnBody: (height: number) => ({ position: 'relative', height }),
  slotLine: (interactive: boolean) => ({ display: 'block', width: '100%', height: SLOT_HEIGHT_PX, border: 0, borderBottom: '1px solid var(--app-border)', p: 0, background: 'transparent', boxSizing: 'border-box', ...(interactive && { cursor: 'pointer', '&:hover': { backgroundColor: 'var(--app-surface-subtle)' }, '&:focus-visible': { outline: '3px solid var(--app-focus)', outlineOffset: -3 } }) }),
  eventLayer: (top: number, height: number, column: number, count: number) => ({ position: 'absolute', top, height, left: `calc(${column * 100 / count}% + 4px)`, width: `calc(${100 / count}% - 8px)`, zIndex: 1 }),
  currentTimeLine: (top: number) => ({ position: 'absolute', top, left: 0, right: 0, height: 2, bgcolor: 'var(--app-danger)', zIndex: 2, pointerEvents: 'none' }),
  currentTimeDot: { position: 'absolute', top: -4, left: -5, width: 10, height: 10, borderRadius: '50%', bgcolor: 'var(--app-danger)' },
} as const;
