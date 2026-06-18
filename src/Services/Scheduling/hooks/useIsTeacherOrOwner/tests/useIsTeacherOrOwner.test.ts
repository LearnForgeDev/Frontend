// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIsTeacherOrOwner } from '@/Services/Scheduling/hooks/useIsTeacherOrOwner/useIsTeacherOrOwner';
import { schoolsEndpoints } from '@/Endpoints/schools.endpoints';

vi.mock('@/Services/Scheduling/hooks/useSchoolId/useSchoolId', () => ({
  useSchoolId: () => 'school-guid-1',
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => vi.restoreAllMocks());

describe('useIsTeacherOrOwner', () => {
  it('true when the viewed school lists an Owner role', async () => {
    vi.spyOn(schoolsEndpoints, 'getMySchools').mockResolvedValue([
      { schoolPublicId: 'school-guid-1', schoolName: 'A', roles: ['Owner'] },
      { schoolPublicId: 'other', schoolName: 'B', roles: ['Student'] },
    ]);
    const { result } = renderHook(() => useIsTeacherOrOwner(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('false when the viewed school only lists Student', async () => {
    vi.spyOn(schoolsEndpoints, 'getMySchools').mockResolvedValue([
      { schoolPublicId: 'school-guid-1', schoolName: 'A', roles: ['Student'] },
    ]);
    const { result } = renderHook(() => useIsTeacherOrOwner(), { wrapper: createWrapper() });
    // stays false after the query settles
    await waitFor(() => expect(schoolsEndpoints.getMySchools).toHaveBeenCalled());
    expect(result.current).toBe(false);
  });

  it('true for a Teacher role', async () => {
    vi.spyOn(schoolsEndpoints, 'getMySchools').mockResolvedValue([
      { schoolPublicId: 'school-guid-1', schoolName: 'A', roles: ['Teacher'] },
    ]);
    const { result } = renderHook(() => useIsTeacherOrOwner(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current).toBe(true));
  });
});
