// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { useScheduleEvents } from '@/Services/Scheduling/hooks/useScheduleEvents/useScheduleEvents';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { expect, test, describe, beforeAll, afterEach, afterAll, vi } from 'vitest';
import type { ScheduleEventDto } from '@/Endpoints/schedule.types';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('@/Services/Scheduling/hooks/useSchoolId/useSchoolId', () => ({
  useSchoolId: () => 's1',
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useScheduleEvents hook', () => {
  test('maps DTOs to domain events on success', async () => {
    const dtos: ScheduleEventDto[] = [
      {
        id: 'e1',
        schoolPublicId: 's1',
        title: 'Algebra',
        description: null,
        startUtc: '2026-06-18T14:00:00Z',
        endUtc: '2026-06-18T15:00:00Z',
        room: 'room-e1',
        hostUserPublicId: 'u1',
        attendees: [{ userPublicId: 'u2', displayName: 'Pat', role: 0, avatarUrl: null }],
      },
    ];

    server.use(
      http.get('*/api/ApiSchedule/s1/events', () => HttpResponse.json(dtos)),
    );

    const { result } = renderHook(() => useScheduleEvents(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].start).toBe('2026-06-18T14:00:00Z');
    expect(result.current.events[0].room).toBe('room-e1');
  });

  test('sets isError when API returns 500', async () => {
    server.use(
      http.get('*/api/ApiSchedule/s1/events', () => new HttpResponse(null, { status: 500 })),
    );

    const { result } = renderHook(() => useScheduleEvents(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeDefined();
    expect(result.current.events).toEqual([]);
  });
});
