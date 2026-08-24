/**
 * @vitest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';
import { useJoinMeeting } from './useJoinMeeting';

const navigateMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@/Services/Scheduling/hooks/useSchoolId/useSchoolId', () => ({
  useSchoolId: () => 'school-public-id',
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  return function TestWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createScheduleEvent(room: string): ScheduleEvent {
  return {
    id: 'event-id',
    title: 'Математика',
    description: null,
    start: '2026-08-22T10:00:00.000Z',
    end: '2026-08-22T11:00:00.000Z',
    room,
    hostUserPublicId: 'host-id',
    attendees: [],
  };
}

describe('useJoinMeeting', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it('navigates to the embedded calls page for the event room', async () => {
    const { result } = renderHook(() => useJoinMeeting(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(createScheduleEvent('Math 101'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/app/schools/school-public-id/calls?room=Math+101&title=%D0%9C%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0');
    });
  });
});
