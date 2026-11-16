export const HOMEWORK_QUESTION_TYPES = [
  { value: 0, label: 'Несколько вариантов' },
  { value: 1, label: 'Один вариант' },
  { value: 2, label: 'Короткий ответ' },
  { value: 3, label: 'Развёрнутый ответ' },
  { value: 4, label: 'Файл или работа от руки' },
];
export const HOMEWORK_STATUSES = ['Черновик', 'На проверке', 'Проверяется', 'Проверено', 'На доработке'];
export const PUBLICATION_LABELS = { Draft: 'Черновик', Published: 'Опубликовано', Queued: 'Ожидает публикации' };
export const HEARTBEAT_MS = 15000;
export const HOMEWORK_POLL_MS = 15000;
export const MAX_ANSWER_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_QUESTION_FILE_BYTES = 10 * 1024 * 1024;
