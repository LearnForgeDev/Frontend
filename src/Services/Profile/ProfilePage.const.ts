export const PROFILE_PAGE_TEXT = {
  title: 'Профиль',
  subtitle: 'Личные данные и школы, в которых вы состоите.',
  schoolsTitle: 'Мои школы',
  schoolsEmpty: 'Вы пока не состоите ни в одной школе.',
  schoolsError: 'Не удалось загрузить список школ.',
  upcomingLessonTitle: 'Ближайшее занятие',
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
