import { describe, expect, it } from 'vitest';
import type { UserIdentity } from '../../src/Assets/Types/commonTypes';
import { matchesRefreshedSession } from '../../src/Endpoints/factory/factory.utils';

const REFRESHED_IDENTITY: UserIdentity = {
  userPublicId: 'current-user',
  userName: 'Пользователь',
  jwtToken: 'new-jwt',
  refreshToken: 'rotated-refresh-token',
  userRoles: [],
  exp: 4_102_444_800_000,
};

describe('Параллельное обновление сессии', () => {
  it('разрешает завершение параллельного запроса с уже применёнными токенами той же сессии', () => {
    const stored = JSON.stringify({ ...REFRESHED_IDENTITY, activeSchoolPublicId: 'selected-school' });

    expect(matchesRefreshedSession(stored, REFRESHED_IDENTITY, REFRESHED_IDENTITY.userPublicId)).toBe(true);
  });

  it('не восстанавливает сессию после выхода во время обновления токенов', () => {
    expect(matchesRefreshedSession(null, REFRESHED_IDENTITY, undefined)).toBe(false);
    expect(matchesRefreshedSession(JSON.stringify(REFRESHED_IDENTITY), REFRESHED_IDENTITY, undefined)).toBe(false);
  });

  it('не заменяет сессию пользователя, вошедшего во время обновления токенов', () => {
    const nextIdentity = { ...REFRESHED_IDENTITY, userPublicId: 'next-user' };

    expect(matchesRefreshedSession(JSON.stringify(nextIdentity), REFRESHED_IDENTITY, 'next-user')).toBe(false);
    expect(matchesRefreshedSession(JSON.stringify(REFRESHED_IDENTITY), REFRESHED_IDENTITY, 'next-user')).toBe(false);
  });

  it.each(['jwtToken', 'refreshToken'] as const)(
    'не продолжает запрос с изменённым токеном %s другой сессии',
    (key) => {
      const stored = JSON.stringify({ ...REFRESHED_IDENTITY, [key]: 'different-token' });

      expect(matchesRefreshedSession(stored, REFRESHED_IDENTITY, REFRESHED_IDENTITY.userPublicId)).toBe(false);
    },
  );

  it.each(['{invalid', 'null', '{}', '[]'])(
    'не продолжает запрос с повреждённой сохранённой сессией %s',
    (stored) => {
      expect(matchesRefreshedSession(stored, REFRESHED_IDENTITY, REFRESHED_IDENTITY.userPublicId)).toBe(false);
    },
  );
});
