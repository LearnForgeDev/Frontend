// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { useLessons } from '@/Services/Lessons/hooks/useLessons/useLessons';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { expect, test, describe, beforeAll, afterEach, afterAll } from 'vitest';
import type { Lesson, LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
    const mockLessons: Lesson[] = [
      { id: '1', title: 'Lesson 1', folderId: null, status: 'draft' },
      { id: '2', title: 'Lesson 2', folderId: 'f1', status: 'draft' },
    ];
    const mockFolders: LessonFolder[] = [
      { id: 'f1', name: 'Folder 1', parentId: null, color: 'blue' },
    ];

    server.use(
      http.get('*/lessons', () => {
        return HttpResponse.json(mockLessons);
      }),
      http.get('*/lessons/folders', () => {
        return HttpResponse.json(mockFolders);
      })
    );

    const { result } = renderHook(
      () => useLessons({ folderId: null, search: '' }),
      { wrapper: createWrapper() }
    );

    // Verify initial loading state
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.lessons).toEqual(mockLessons);
    expect(result.current.folders).toEqual(mockFolders);
    expect(result.current.error).toBeNull();
  });

  test('sets isError when API returns 500', async () => {
    server.use(
      http.get('*/lessons', () => {
        return new HttpResponse(null, { status: 500 });
      }),
      http.get('*/lessons/folders', () => {
        return HttpResponse.json([]);
      })
    );

    const { result } = renderHook(
      () => useLessons({ folderId: null, search: '' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.status).toBe(500);
  });
});
