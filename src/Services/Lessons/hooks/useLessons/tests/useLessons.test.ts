// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { useLessons } from '@/Services/Lessons/hooks/useLessons/useLessons';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { expect, test, describe, beforeAll, afterEach, afterAll, vi } from 'vitest';
import type { LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return {
    ...original,
    useParams: () => ({ schoolPublicId: '1' }),
  };
});

vi.mock('@/Services/Lessons/hooks/useSchoolId/useSchoolId', () => ({
  useSchoolId: () => 1,
}));

vi.mock('@/Storage/Context/LessonsContext', () => ({
  useLessonsContext: () => ({
    folderId: null,
    search: '',
    sort: 'title',
    order: 'asc',
    allFolders: [
      { id: 'f1', name: 'Folder 1', parentId: null, color: 'blue' },
    ] as LessonFolder[],
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLessons hook', () => {
  test('returns combined lessons and folders on success', async () => {
    const mockLessons = [
      { id: '1', name: 'lesson::Lesson 1::1::draft.lesson' },
      { id: '2', name: 'lesson::Lesson 2::2::draft.lesson' },
    ];

    server.use(
      http.get('*/api/ApiFiles/1', () => {
        return HttpResponse.json(mockLessons);
      })
    );

    const { result } = renderHook(
      () => useLessons(),
      { wrapper: createWrapper() }
    );

    // Verify initial loading state
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.lessons?.length).toBe(2);
    expect(result.current.folders?.length).toBe(1);
    expect(result.current.error).toBeNull();
  });

  test('sets isError when API returns 500', async () => {
    server.use(
      http.get('*/api/ApiFiles/1', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useLessons(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeDefined();
  });
});
