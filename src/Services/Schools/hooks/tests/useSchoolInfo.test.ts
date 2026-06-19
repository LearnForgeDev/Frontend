// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { useSchoolInfo } from '@/Services/Schools/hooks/useSchoolInfo';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { expect, test, describe, beforeAll, afterEach, afterAll } from 'vitest';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSchoolInfo hook', () => {
  test('returns the school info on success', async () => {
    server.use(
      http.get('*/api/ApiSchool/s1', () =>
        HttpResponse.json({ publicId: 's1', name: 'Хогвартс' }),
      ),
    );

    const { result } = renderHook(() => useSchoolInfo('s1'), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.school?.name).toBe('Хогвартс');
  });

  test('sets isError on 500', async () => {
    server.use(
      http.get('*/api/ApiSchool/s1', () => new HttpResponse(null, { status: 500 })),
    );

    const { result } = renderHook(() => useSchoolInfo('s1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(true);
    expect(result.current.school).toBeNull();
  });

  test('does not fetch when schoolPublicId is undefined', () => {
    const { result } = renderHook(() => useSchoolInfo(undefined), { wrapper: createWrapper() });

    // Query is disabled → never enters loading, stays null.
    expect(result.current.isLoading).toBe(false);
    expect(result.current.school).toBeNull();
  });
});
