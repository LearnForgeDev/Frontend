import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook } from '@testing-library/react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import SessionQueryProvider from './SessionQueryProvider';

const identity = vi.hoisted(() => ({ userPublicId: 'teacher' }));
vi.mock('@/Storage/useGlobalContext/useGlobalContext', () => ({
  useGlobalContext: (select: (state: { auth: { user: { userPublicId: string } } }) => unknown) =>
    select({ auth: { user: identity } }),
}));
vi.mock('@/Endpoints/factory/factory', () => ({ createApiClient: () => new QueryClient() }));

afterEach(cleanup);

describe('Кеш сессии', () => {
  it('не переносит учеников и прогресс между аккаунтами', () => {
    const { rerender, result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }: { children: ReactNode }) => <SessionQueryProvider>{children}</SessionQueryProvider>,
    });
    const previousClient = result.current;
    result.current.setQueryData(['courses', 'school', 'course'], { students: ['private-student'], canManage: true });
    identity.userPublicId = 'student';
    rerender();
    expect(result.current).not.toBe(previousClient);
    expect(result.current.getQueryData(['courses', 'school', 'course'])).toBeUndefined();
  });
});
