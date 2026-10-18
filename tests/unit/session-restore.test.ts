import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeRestoredSession } from '../../src/Endpoints/auth/utils';
import {
  getSessionStorageSnapshot,
  readStoredSession,
} from '../../src/Services/Auth/hooks/useRestoreSession/useRestoreSession.utils';

const CURRENT_DATE = new Date('2026-10-18T12:00:00Z');
const VALID_EXPIRY_SECONDS = Date.parse('2026-10-18T13:00:00Z') / 1000;
const EXPIRED_SECONDS = Date.parse('2026-10-18T11:00:00Z') / 1000;

function tokenWithExpiry(exp: unknown) {
  return `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
}

const RESTORED_IDENTITY = {
  userPublicId: 'server-user',
  userName: 'Проверенный пользователь',
  jwtToken: tokenWithExpiry(VALID_EXPIRY_SECONDS),
  refreshToken: 'server-refresh-token',
  userRoles: [],
};

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe('Чтение сохранённой сессии', () => {
  it.each(['{invalid', 'null', '[]', '{}', '{"refreshToken":42}', '{"refreshToken":"  "}'])(
    'отклоняет повреждённую или неполную запись %s',
    (value) => expect(readStoredSession(value)).toBeNull(),
  );

  it('читает только refreshToken и не доверяет сохранённым данным пользователя', () => {
    expect(readStoredSession(JSON.stringify({
      refreshToken: 'saved-refresh', userPublicId: 'forged-user', userName: 'Поддельное имя',
    }))).toEqual({ refreshToken: 'saved-refresh' });
  });

  it('сохраняет выбранную школу для восстановления после проверки сессии', () => {
    expect(readStoredSession(JSON.stringify({
      refreshToken: 'saved-refresh', activeSchoolPublicId: 'selected-school',
    }))).toEqual({ refreshToken: 'saved-refresh', activeSchoolPublicId: 'selected-school' });
  });

  it.each([42, null, {}, []])('игнорирует некорректный идентификатор школы %s', (school) => {
    expect(readStoredSession(JSON.stringify({
      refreshToken: 'saved-refresh', activeSchoolPublicId: school,
    }))).toEqual({ refreshToken: 'saved-refresh' });
  });

  it('возвращает точную запись для проверки её изменения во время запроса', () => {
    const stored = JSON.stringify({ refreshToken: 'original-refresh', activeSchoolPublicId: 'school' });
    localStorage.setItem('user_identity', stored);

    expect(getSessionStorageSnapshot()).toBe(stored);

    localStorage.removeItem('user_identity');

    expect(getSessionStorageSnapshot()).toBeNull();
  });

  it('обрабатывает заблокированное хранилище как отсутствие сохранённой сессии', () => {
    vi.spyOn(Object.getPrototypeOf(localStorage), 'getItem').mockImplementation(() => {
      throw new Error('Хранилище недоступно');
    });

    expect(getSessionStorageSnapshot()).toBeNull();
  });
});

describe('Данные сессии после ответа сервера', () => {
  it('вычисляет срок сессии из нового JWT вместо сохранённого exp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(CURRENT_DATE);

    expect(normalizeRestoredSession({ ...RESTORED_IDENTITY, exp: 1 })).toEqual({
      ...RESTORED_IDENTITY,
      exp: VALID_EXPIRY_SECONDS * 1000,
    });
  });

  it.each(['jwtToken', 'refreshToken', 'userPublicId', 'userName', 'userRoles'] as const)(
    'не принимает ответ без обязательного поля %s',
    (key) => {
      vi.useFakeTimers();
      vi.setSystemTime(CURRENT_DATE);

      expect(normalizeRestoredSession({ ...RESTORED_IDENTITY, [key]: undefined })).toBeNull();
    },
  );

  it.each([EXPIRED_SECONDS, undefined, 'invalid'])('не принимает JWT со сроком %s', (exp) => {
    vi.useFakeTimers();
    vi.setSystemTime(CURRENT_DATE);

    expect(normalizeRestoredSession({ ...RESTORED_IDENTITY, jwtToken: tokenWithExpiry(exp) })).toBeNull();
  });

  it('не принимает повреждённый JWT', () => {
    expect(normalizeRestoredSession({ ...RESTORED_IDENTITY, jwtToken: 'invalid-token' })).toBeNull();
  });
});
