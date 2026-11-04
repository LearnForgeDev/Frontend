export const PROFILE_CARDS_STACK_MAX_WIDTH_PX = 350;

export const PROFILE_PAGE_TEXT = {
  title: 'Профиль',
  subtitle: 'Личные данные и школы, в которых вы состоите.',
  schoolsTitle: 'Мои школы',
  addSchool: 'Добавить школу',
  schoolsEmpty: 'Вы пока не состоите ни в одной школе.',
  schoolsError: 'Не удалось загрузить список школ.',
  upcomingLessonTitle: 'Ближайшее занятие',
  createLesson: 'Создать занятие',
  upcomingLessonEmpty: 'Ближайших занятий пока нет.',
  scheduleError: 'Не удалось загрузить ближайшее занятие.',
  openCalendar: 'Открыть в календаре',
  rolePrefix: 'Роль:',
  notAuthorized: 'Пользователь не авторизован.',
} as const;

export const SCHOOL_ROLE_LABELS: Record<string, string> = {
  Student: 'Ученик',
  Teacher: 'Преподаватель',
  Owner: 'Владелец',
  Founder: 'Владелец',
};
