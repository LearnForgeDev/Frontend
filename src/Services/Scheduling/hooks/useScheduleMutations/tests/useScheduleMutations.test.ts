// @vitest-environment jsdom
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { expect, test, describe, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useScheduleMutations } from '@/Services/Scheduling/hooks/useScheduleMutations/useScheduleMutations';
import type { CreateScheduleEventInput } from '@/Services/Scheduling/Scheduling.types';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('@/Services/Scheduling/hooks/useSchoolId/useSchoolId', () => ({
  useSchoolId: () => 's1',
}));

const dto = {
  id: 'e1', schoolPublicId: 's1', title: 'Algebra', description: null,
  startUtc: '2026-06-18T14:00:00Z', endUtc: '2026-06-18T15:00:00Z',
  room: 'room-e1', hostUserPublicId: 'u1', attendees: [],
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const input: CreateScheduleEventInput = {
  title: 'Algebra', description: null,
  startUtc: '2026-06-18T14:00:00Z', endUtc: '2026-06-18T15:00:00Z',
  attendeeUserPublicIds: [],
};

describe('useScheduleMutations', () => {
  test('createEvent posts and maps the DTO to a domain event', async () => {
    server.use(http.post('*/api/ApiSchedule/s1/events', () => HttpResponse.json(dto)));

    const { result } = renderHook(() => useScheduleMutations(), { wrapper: createWrapper() });

    let created;
    await act(async () => {
      created = await result.current.createEvent.mutateAsync(input);
    });

    expect(created).toMatchObject({ id: 'e1', start: '2026-06-18T14:00:00Z', room: 'room-e1' });
  });

  test('deleteEvent issues a DELETE', async () => {
    let deleted = false;
    server.use(
      http.delete('*/api/ApiSchedule/s1/events/e1', () => {
        deleted = true;
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const { result } = renderHook(() => useScheduleMutations(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.deleteEvent.mutateAsync('e1');
    });

    await waitFor(() => expect(deleted).toBe(true));
  });
});
