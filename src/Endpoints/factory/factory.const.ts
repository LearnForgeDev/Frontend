export const REQUEST_TIMEOUT_MS = 15_000;
export const FILE_TRANSFER_TIMEOUT_MS = 120_000;
export const READ_REQUEST_RETRY_COUNT = 1;
export const RETRY_DELAY_MS = 1_000;
export const MAX_RETRY_DELAY_MS = 5_000;
export const SAFE_RETRY_METHODS = ['get', 'head'];
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
};
export const REQUEST_ERROR_MESSAGES = {
  unavailable: 'Сервер временно недоступен. Попробуйте ещё раз чуть позже.',
  unauthorized: 'Сессия истекла. Войдите снова.',
  forbidden: 'У вас нет доступа к этому действию.',
  notFound: 'Запрошенные данные не найдены.',
  invalid: 'Проверьте введённые данные и попробуйте ещё раз.',
  conflict: 'Данные изменились. Обновите страницу и попробуйте ещё раз.',
  tooManyRequests: 'Слишком много запросов. Попробуйте ещё раз чуть позже.',
  generic: 'Не удалось выполнить действие. Попробуйте ещё раз.',
};
