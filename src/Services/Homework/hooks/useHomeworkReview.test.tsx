import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import type { HomeworkAttemptDto } from '@/Endpoints/Homework/homework.type';
import { createApplicationStore } from '@/Storage/Application/application.store';
import { homeworkAttempt } from '../homework.testUtils';
import { useHomeworkReview } from './useHomeworkReview';

const mocks = vi.hoisted(() => ({ review: vi.fn() }));
vi.mock('@/Endpoints/Homework/homework', () => ({ homeworkEndpoints: mocks }));
vi.mock('@/Services/Auth/hooks/useUser', () => ({ useUser: () => ({ user: { userPublicId: 'teacher' } }) }));

function setup(attempt = homeworkAttempt({ status: 1, submissionNumber: 1 })) {
  const store = createApplicationStore();
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}><MemoryRouter initialEntries={['/school']}><Routes><Route path="/:schoolPublicId" element={children} /></Routes></MemoryRouter></Provider>;
  return { store, ...renderHook(({ value }) => useHomeworkReview(value), { wrapper, initialProps: { value: attempt } }) };
}

beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

describe('Private teacher review drafts', () => {
  it('saves partial credit privately with its submission/revision then releases final review', async () => {
    const attempt = homeworkAttempt({ status: 1, submissionNumber: 1 });
    const { result, rerender } = setup(attempt);
    act(() => {
      result.current.change({ ...result.current.review, reviewComment: 'Проверяю', answers: [{ questionId: 11, score: 0.5, teacherComment: 'Почти', annotations: [] }] });
    });
    const saved = { ...result.current.review, revision: 1 };
    mocks.review.mockResolvedValue({ ...attempt, reviewDraft: saved });
    await act(async () => {
      await result.current.save();
    });
    expect(mocks.review).toHaveBeenLastCalledWith('school', 'attempt-1', expect.objectContaining({ submissionNumber: 1, revision: 0 }), false);
    expect(result.current.hasChanges).toBe(false);
    rerender({ value: { ...attempt, reviewDraft: saved } });
    mocks.review.mockResolvedValue({ ...attempt, status: 3, score: 0.5 });
    await act(async () => {
      await result.current.save(true);
    });
    expect(mocks.review).toHaveBeenLastCalledWith('school', 'attempt-1', expect.anything(), true);
  });

  it('retains newer unsaved edits while advancing the accepted server revision', async () => {
    let finish: ((value: HomeworkAttemptDto) => void) | undefined;
    mocks.review.mockImplementation(() => new Promise<HomeworkAttemptDto>(resolve => {
      finish = resolve;
    }));
    const attempt = homeworkAttempt({ status: 1, submissionNumber: 1 });
    const { result } = setup(attempt);
    act(() => {
      result.current.change({ ...result.current.review, reviewComment: 'Старый' });
    });
    let pending: Promise<HomeworkAttemptDto | null> | undefined;
    act(() => {
      pending = result.current.save();
    });
    const saved = result.current.review;
    act(() => {
      result.current.change({ ...result.current.review, reviewComment: 'Новый' });
    });
    await act(async () => {
      finish?.({ ...attempt, reviewDraft: { ...saved, revision: 1 } });
      await pending;
    });
    expect(result.current.review.reviewComment).toBe('Новый');
    expect(result.current.review.revision).toBe(1);
    expect(result.current.hasChanges).toBe(true);
  });

  it('refuses incomplete final scores, keeps failed drafts and permits returning without full scores', async () => {
    const { result } = setup();
    await act(async () => {
      await result.current.save(true);
    });
    expect(mocks.review).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/каждый/);
    act(() => {
      result.current.change({ ...result.current.review, returnForRevision: true, reviewComment: 'Исправьте' });
    });
    mocks.review.mockRejectedValue(new Error('Конфликт проверки'));
    await act(async () => {
      await result.current.save(true);
    });
    expect(result.current.review.reviewComment).toBe('Исправьте');
    expect(result.current.error).toBe('Конфликт проверки');
  });
});
