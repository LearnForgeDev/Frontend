import type { ScheduleEvent } from '../Scheduling/Scheduling.types';
import { SCHOOL_ROLE_LABELS } from './ProfilePage.const';

export const getClosestEvent = (
  events: ScheduleEvent[] | undefined,
): ScheduleEvent | null => {
  if (!events) {
    return null;
  }

  const now = Date.now();

  return [...events]
    .filter((event) => new Date(event.end).getTime() >= now)
    .sort(
      (first, second) =>
        new Date(first.start).getTime() - new Date(second.start).getTime(),
    )[0] ?? null;
};

export const formatSchoolRoles = (roles: string[]): string => {
  return [...new Set(roles.map((role) => SCHOOL_ROLE_LABELS[role] ?? role))].join(', ');
};
