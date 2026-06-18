// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { useSchoolMembers } from '@/Services/Scheduling/hooks/useSchoolMembers/useSchoolMembers';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { expect, test, describe, beforeAll, afterEach, afterAll, vi } from 'vitest';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('@/Services/Scheduling/hooks/useSchoolId/useSchoolId', () => ({
  useSchoolId: () => 's1',
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSchoolMembers hook', () => {
  test('returns members on success', async () => {
    server.use(
      http.get('*/api/ApiSchool/s1/members', () =>
        HttpResponse.json([{ userPublicId: 'u1', displayName: 'Ada' }]),
      ),
    );

    const { result } = renderHook(() => useSchoolMembers(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.members).toHaveLength(1);
    expect(result.current.members[0].displayName).toBe('Ada');
  });

  test('sets isError on 500', async () => {
    server.use(
      http.get('*/api/ApiSchool/s1/members', () => new HttpResponse(null, { status: 500 })),
    );

    const { result } = renderHook(() => useSchoolMembers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(true);
    expect(result.current.members).toEqual([]);
  });
});
