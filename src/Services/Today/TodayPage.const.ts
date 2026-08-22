export const RECENT_LESSONS_LIMIT = 3;

export const TODAY_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
};

export const TODAY_PAGE_TEXT = {
  title: 'Сегодня',
  createLesson: 'Создать урок',
  scheduleLesson: 'Запланировать занятие',
  nextLesson: 'Ближайшее занятие',
  noUpcomingLessons: 'Ближайших занятий пока нет.',
  todaySchedule: 'Расписание на сегодня',
  openCalendar: 'Открыть календарь',
  emptySchedule: 'На сегодня занятий нет.',
  recentLessons: 'Последние уроки',
  openAllLessons: 'Все уроки',
  emptyLessons: 'Уроки ещё не добавлены.',
  scheduleError: 'Не удалось загрузить расписание.',
  lessonsError: 'Не удалось загрузить уроки.',
  schoolSummary: 'Школа',
  studentsCount: 'Учеников',
  schoolSummaryError: 'Не удалось загрузить сводку школы.',
} as const;
