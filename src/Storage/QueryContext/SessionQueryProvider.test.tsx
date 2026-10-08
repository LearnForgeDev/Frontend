import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import SessionQueryProvider from './SessionQueryProvider';

afterEach(() => {
  cleanup();
  useGlobalContext.getState().auth.logout();
  localStorage.clear();
});

describe('Кеш сессии', () => {
  it('не переносит учеников и прогресс между аккаунтами', () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }: { children: ReactNode }) => <SessionQueryProvider>{children}</SessionQueryProvider>,
    });
    const previousClient = result.current;
    previousClient.setQueryData(['courses', 'school', 'course'], { students: ['private-student'], canManage: true });
    act(() => useGlobalContext.getState().auth.setUser({
      userPublicId: 'next-account', userName: 'Ученик', jwtToken: '', refreshToken: '', userRoles: [], exp: 0,
    }));
    expect(result.current).not.toBe(previousClient);
    expect(result.current.getQueryData(['courses', 'school', 'course'])).toBeUndefined();
  });
});
