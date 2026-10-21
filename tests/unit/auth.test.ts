import { afterEach, describe, expect, it } from 'vitest';
import { parseJwt } from '../../src/Endpoints/auth/utils';
import { getAuthPath, getRedirectPath } from '../../src/Services/Auth/Pages/AuthLayout/AuthLayout.utils';
import { useGlobalContext } from '../../src/Storage/useGlobalContext/useGlobalContext';
import { AuthRole, type UserIdentity } from '../../src/Assets/Types/commonTypes';

const identity: UserIdentity = {
  userPublicId: 'student', userName: 'Ученик', jwtToken: 'token', refreshToken: 'refresh', exp: 0,
  userRoles: [{ role: AuthRole.STUDENT, schoolId: 1, userId: 1 }],
};
afterEach(() => {
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Авторизация и выбор школы', () => {
  it('декодирует JWT с русским именем и временем истечения', () => {
    const payload = { userId: 'student', name: 'Ученик', exp: '1792324800' };
    const token = `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
    expect(parseJwt(token)).toEqual(payload);
    expect(() => parseJwt('invalid')).toThrow();
  });

  it('сохраняет разрешённый путь, query и hash между формами', () => {
    const target = '/app/schools/school/schedule?eventId=event#details';
    expect(getRedirectPath({ fromLocation: target })).toBe(target);
    for (const mode of ['login', 'register'] as const) {
      const url = new URL(getAuthPath(mode, target), 'https://learnforge.invalid');
      expect(url.searchParams.get('returnTo')).toBe(target);
    }
    expect(getRedirectPath({})).toBe('/app');
  });

  it.each(['https://evil.invalid', '//evil.invalid/app', '/\\\\evil.invalid/app', '/auth/login', '/app/../../outside', 'javascript:alert(1)'])(
    'не перенаправляет на внешний или неподходящий адрес %s',
    (fromLocation) => expect(getRedirectPath({ fromLocation })).toBe('/app'),
  );

  it('сохраняет пользователя и выбранную школу, очищает сессию при выходе', () => {
    useGlobalContext.getState().auth.setUser(identity);
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(true);
    expect(useGlobalContext.getState().auth.user?.roles[0].role).toBe(AuthRole.STUDENT);
    useGlobalContext.getState().auth.setActiveSchoolPublicId('school');
    expect(JSON.parse(localStorage.getItem('user_identity')!).activeSchoolPublicId).toBe('school');
    useGlobalContext.getState().auth.logout();
    expect(useGlobalContext.getState().auth.user).toBeNull();
    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem('user_identity')).toBeNull();
  });

  it('не выбирает школу без пользователя', () => {
    useGlobalContext.getState().auth.logout();
    useGlobalContext.getState().auth.setActiveSchoolPublicId('school');
    expect(useGlobalContext.getState().auth.user).toBeNull();
    expect(localStorage.getItem('user_identity')).toBeNull();
  });
});
