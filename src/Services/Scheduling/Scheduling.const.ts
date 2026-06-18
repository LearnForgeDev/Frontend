/** Constants for the Scheduling (calendar) feature. */

/** A session becomes joinable this many minutes before its start time. */
export const JOIN_WINDOW_MINUTES = 5;

/** First hour rendered in the day/widget grid (24h clock). */
export const WIDGET_VISIBLE_START_HOUR = 0;

/** Last hour rendered in the day/widget grid (24h clock, inclusive — shows 24:00). */
export const WIDGET_VISIBLE_END_HOUR = 24;

/** Pixel height of a single one-hour slot in the calendar grid. */
export const SLOT_HEIGHT_PX = 64;

/** Maximum attendee avatars shown before collapsing into a "+N" overflow. */
export const MAX_VISIBLE_ATTENDEES = 4;

/** Accent color for event blocks — theme primary (`palette.primary.main`). */
export const EVENT_COLOR = '#4968f2';
