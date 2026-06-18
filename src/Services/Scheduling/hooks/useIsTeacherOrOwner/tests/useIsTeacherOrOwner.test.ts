// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { useIsTeacherOrOwner } from '@/Services/Scheduling/hooks/useIsTeacherOrOwner/useIsTeacherOrOwner';
import { useGlobalContext } from '@/Storage/Context/useGlobalContext';

const baseUser = (role: 0 | 1 | 2) => ({
  userPublicId: 'u1',
  userName: 'Ada',
  roles: [{ role, schoolId: 7 }] as Array<{ role: 0 | 1 | 2; schoolId: number }>,
  activeSchoolId: 7,
});

afterEach(() => {
  useGlobalContext.setState((s) => ({ auth: { ...s.auth, user: null, isAuthenticated: false } }));
});

describe('useIsTeacherOrOwner', () => {
  it('false when not authenticated', () => {
    const { result } = renderHook(() => useIsTeacherOrOwner());
    expect(result.current).toBe(false);
  });

  it('false for a student', () => {
    useGlobalContext.setState((s) => ({ auth: { ...s.auth, user: baseUser(0), isAuthenticated: true } }));
    const { result } = renderHook(() => useIsTeacherOrOwner());
    expect(result.current).toBe(false);
  });

  it('true for a teacher in the active school', () => {
    useGlobalContext.setState((s) => ({ auth: { ...s.auth, user: baseUser(1), isAuthenticated: true } }));
    const { result } = renderHook(() => useIsTeacherOrOwner());
    expect(result.current).toBe(true);
  });
});
