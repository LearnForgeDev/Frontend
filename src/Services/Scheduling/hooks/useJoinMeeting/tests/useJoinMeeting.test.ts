// @vitest-environment jsdom
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';
import { useJoinMeeting } from '@/Services/Scheduling/hooks/useJoinMeeting/useJoinMeeting';
import { meetEndpoints } from '@/Endpoints/meet.endpoints';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import type { AppError } from '@/Endpoints/factory';

vi.mock('@/Services/Scheduling/hooks/useSchoolId/useSchoolId', () => ({
  useSchoolId: () => 's1',
}));

const event: ScheduleEvent = {
  id: 'e1',
  title: 'Algebra',
  description: null,
  start: '2026-06-18T14:00:00Z',
  end: '2026-06-18T15:00:00Z',
  room: 'room-e1',
  hostUserPublicId: 'u1',
  attendees: [],
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => {
  useGlobalNotificationStore.setState({ notifications: [] });
});

afterEach(() => vi.restoreAllMocks());

describe('useJoinMeeting hook', () => {
  test('opens the roomUrl in a new tab on success', async () => {
    vi.spyOn(meetEndpoints, 'getMeetToken').mockResolvedValue({ roomUrl: 'https://meet/x' });
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    const { result } = renderHook(() => useJoinMeeting(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync(event);
    });

    expect(meetEndpoints.getMeetToken).toHaveBeenCalledWith({ schoolPublicId: 's1', Room: 'room-e1' });
    expect(openSpy).toHaveBeenCalledWith('https://meet/x', '_blank', 'noopener,noreferrer');
  });

  test('pushes a high-priority notification on error', async () => {
    const err: AppError = { message: 'nope', code: 'FORBIDDEN', status: 403 };
    vi.spyOn(meetEndpoints, 'getMeetToken').mockRejectedValue(err);

    const { result } = renderHook(() => useJoinMeeting(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutate(event);
    });

    await waitFor(() => {
      const notes = useGlobalNotificationStore.getState().notifications;
      expect(notes.length).toBe(1);
      expect(notes[0].priority).toBe('high');
      expect(notes[0].subtitle).toContain('permission');
    });
  });
});
