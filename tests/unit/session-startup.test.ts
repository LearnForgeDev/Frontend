import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('Восстановление сессии', () => {
  it('не авторизует пользователя из user_identity без подтверждения сервером', async () => {
    localStorage.setItem('user_identity', JSON.stringify({
      userPublicId: 'nonexistent-user',
      userName: 'Несуществующий пользователь',
      userRoles: [],
    }));
    vi.resetModules();

    const { useGlobalContext } = await import('../../src/Storage/useGlobalContext/useGlobalContext');

    expect(useGlobalContext.getState().auth.isAuthenticated).toBe(false);
    expect(useGlobalContext.getState().auth.user).toBeNull();
  });
});
