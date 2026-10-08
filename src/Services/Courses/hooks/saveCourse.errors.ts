export class CourseCreationUncertainError extends Error {
  constructor() {
    super('Не удалось подтвердить создание. Закройте форму и проверьте список курсов перед повтором.');
    this.name = 'CourseCreationUncertainError';
  }
}
