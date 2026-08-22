import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { isSameDay } from '@/Services/Scheduling/utils/time.utils';
import { RECENT_LESSONS_LIMIT, TODAY_DATE_FORMAT } from './TodayPage.const';

export const getUpcomingEvent = (
  events: ScheduleEvent[],
  now: Date = new Date(),
): ScheduleEvent | null => {
  const nowTime = now.getTime();

  return [...events]
    .filter((event) => new Date(event.end).getTime() >= nowTime)
    .sort((first, second) => {
      const firstStart = new Date(first.start).getTime();
      const secondStart = new Date(second.start).getTime();
      return firstStart - secondStart;
    })[0] ?? null;
};

export const getTodayEvents = (
  events: ScheduleEvent[],
  today: Date = new Date(),
): ScheduleEvent[] => {
  return events
    .filter((event) => isSameDay(new Date(event.start), today))
    .sort(
      (first, second) =>
        new Date(first.start).getTime() - new Date(second.start).getTime(),
    );
};

export const getRecentLessons = (lessons: Lesson[] | undefined): Lesson[] => {
  if (!lessons) {
    return [];
  }

  return lessons
    .map((lesson, index) => ({ lesson, index }))
    .sort((first, second) => {
      const firstUpdatedAt = Date.parse(first.lesson.updatedAt ?? '');
      const secondUpdatedAt = Date.parse(second.lesson.updatedAt ?? '');

      if (Number.isNaN(firstUpdatedAt) && Number.isNaN(secondUpdatedAt)) {
        return first.index - second.index;
      }

      if (Number.isNaN(firstUpdatedAt)) {
        return 1;
      }

      if (Number.isNaN(secondUpdatedAt)) {
        return -1;
      }

      return secondUpdatedAt - firstUpdatedAt;
    })
    .slice(0, RECENT_LESSONS_LIMIT)
    .map(({ lesson }) => lesson);
};

export const formatTodayDate = (date: Date = new Date()): string => {
  const formattedDate = date.toLocaleDateString('ru-RU', TODAY_DATE_FORMAT);
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};
