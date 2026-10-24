export const EXPIRED_SESSION_TIMESTAMP = 1;
export const SESSION_REFRESH_PATH = '/api/ApiAuth/refreshToken';
export const SESSION_REFRESH_CASES = [
  { name: 'истечение локального JWT', removeCookie: false },
  { name: 'отклонение JWT сервером', removeCookie: true },
];
