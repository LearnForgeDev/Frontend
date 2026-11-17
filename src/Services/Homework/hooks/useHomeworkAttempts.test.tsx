import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { createApplicationStore } from '@/Storage/Application/application.store';
import { homeworkAttempt } from '../homework.testUtils';
import { useHomeworkAttempts } from './useHomeworkAttempts';

const mocks = vi.hoisted(() => ({ attempts: vi.fn(), start: vi.fn() }));
vi.mock('@/Endpoints/Homework/homework', () => ({ homeworkEndpoints: mocks }));
vi.mock('@/Services/Auth/hooks/useUser', () => ({ useUser: () => ({ user: { userPublicId: 'student' } }) }));

function setup() {
  const store = createApplicationStore();
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}><MemoryRouter initialEntries={['/school/homework']}><Routes><Route path="/:schoolPublicId/:homeworkPublicId" element={children} /></Routes></MemoryRouter></Provider>;
  return renderHook(() => useHomeworkAttempts(true), { wrapper });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.attempts.mockResolvedValue([homeworkAttempt()]);
});
afterEach(cleanup);

describe('Student attempt history and idempotent start', () => {
  it('loads own history and reuses an uncertain start key until a confirmed result', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(mocks.attempts).toHaveBeenCalledWith('school', 'homework', true);
    expect(result.current.attempts[0].student.name).toBe('Анна');
    mocks.start.mockRejectedValueOnce(new Error('Сеть недоступна')).mockResolvedValue(homeworkAttempt());
    await act(async () => {
      await result.current.start();
    });
    const firstKey = mocks.start.mock.calls[0][2];
    expect(result.current.state.error).toBe('Сеть недоступна');
    await act(async () => {
      await result.current.start();
    });
    expect(mocks.start.mock.calls[1][2]).toBe(firstKey);
    expect(result.current.busy).toBe(false);
    await act(async () => {
      await result.current.start();
    });
    expect(mocks.start.mock.calls[2][2]).not.toBe(firstKey);
  });
});
