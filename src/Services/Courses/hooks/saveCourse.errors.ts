export class CourseCreationUncertainError extends Error {
  constructor(message = 'Ответ о создании курса не получен. Закройте редактор и обновите список перед продолжением.') {
    super(message);
    this.name = 'CourseCreationUncertainError';
  }
}
