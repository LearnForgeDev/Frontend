import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { AxiosError } from 'axios';
import { createApplicationStore } from '@/Storage/Application/application.store';
import { HOMEWORK_TEST_TIME, homeworkAttempt, homeworkDefinition, homeworkQuestion } from '../homework.testUtils';
import { answerDraftKey, listAnswerDrafts, persistAnswerDraft } from '../homework.drafts';
import type { HomeworkAttemptDto } from '@/Endpoints/Homework/homework.type';
import { useHomeworkAttempt } from './useHomeworkAttempt';

const mocks = vi.hoisted(() => ({ getAttempt: vi.fn(), saveAnswer: vi.fn(), presence: vi.fn(), leave: vi.fn(), submit: vi.fn(), presign: vi.fn(), completeUpload: vi.fn(), removeAnswerFile: vi.fn(), uploadFileDirect: vi.fn() }));
vi.mock('@/Endpoints/Homework/homework', () => ({ homeworkEndpoints: mocks }));
vi.mock('@/Endpoints/files/files.endpoints', () => ({ filesEndpoints: mocks }));
vi.mock('@/Endpoints/files/md5.utils', () => ({ calculateContentMd5Base64: async () => 'checksum' }));
vi.mock('@/Services/Auth/hooks/useUser', () => ({ useUser: () => ({ user: { userPublicId: 'student-1' } }) }));
vi.mock('./useHomeworkRealtime', () => ({ useHomeworkRealtime: () => undefined }));

function setup() {
  const store = createApplicationStore();
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}><MemoryRouter initialEntries={['/school/homework-1/attempt-1']}><Routes><Route path="/:schoolPublicId/:homeworkPublicId/:attemptPublicId" element={children} /></Routes></MemoryRouter></Provider>;
  return { store, ...renderHook(useHomeworkAttempt, { wrapper }) };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getAttempt.mockResolvedValue(homeworkAttempt());
  mocks.presence.mockResolvedValue(homeworkAttempt());
  mocks.leave.mockResolvedValue(homeworkAttempt());
  mocks.submit.mockResolvedValue(homeworkAttempt({ status: 1 }));
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Homework attempt operations', () => {
  it('loads pinned definition, leases a tab, saves with its revision and submits persisted work', async () => {
    mocks.saveAnswer.mockResolvedValue(homeworkAttempt({ answers: [{ questionId: 11, revision: 1, textValue: 'Ответ', richText: null, selectedOptionIds: [], files: [], annotations: [], score: null, isCorrect: null, teacherComment: null }] }));
    const { result, unmount } = setup();
    await waitFor(() => expect(result.current.editable).toBe(true));
    await waitFor(() => expect(mocks.presence).toHaveBeenCalledOnce());
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Ответ' }));
    expect(result.current.dirty).toBe(true);
    await act(async () => expect(await result.current.save()).toBe(true));
    expect(mocks.saveAnswer).toHaveBeenCalledWith('school', 'attempt-1', expect.objectContaining({ questionId: 11, textValue: 'Ответ', revision: 0, tabId: expect.any(String) }));
    expect(result.current.dirty).toBe(false);
    expect(listAnswerDrafts(answerDraftKey('student-1:school', 'attempt-1', 1, 11))).toEqual([]);
    await act(async () => {
      await result.current.submit();
    });
    expect(mocks.submit).toHaveBeenCalledOnce();
    expect(result.current.attempt?.status).toBe(1);
    unmount();
    expect(mocks.leave).toHaveBeenCalledWith('school', 'attempt-1', expect.any(String));
  });

  it('retains edits made during an older save and advances only their accepted revision', async () => {
    let resolveSave: ((value: HomeworkAttemptDto) => void) | undefined;
    mocks.saveAnswer.mockImplementationOnce(() => new Promise<HomeworkAttemptDto>(resolve => {
      resolveSave = resolve;
    }));
    const { result } = setup();
    await waitFor(() => expect(result.current.editable).toBe(true));
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Первый' }));
    let pending: Promise<boolean> | undefined;
    act(() => {
      pending = result.current.save();
    });
    await waitFor(() => expect(mocks.saveAnswer).toHaveBeenCalledOnce());
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Новый' }));
    await act(async () => {
      resolveSave?.(homeworkAttempt({ answers: [{ questionId: 11, revision: 1, textValue: 'Первый', richText: null, selectedOptionIds: [], files: [], annotations: [], score: null, isCorrect: null, teacherComment: null }] }));
      await pending;
    });
    expect(result.current.answerDraft(11)).toMatchObject({ textValue: 'Новый', revision: 1 });
    expect(result.current.dirty).toBe(true);
    expect(listAnswerDrafts(answerDraftKey('student-1:school', 'attempt-1', 1, 11))[0]?.answer).toMatchObject({ textValue: 'Новый', revision: 1 });
  });

  it('freezes answer input synchronously before the final save starts', async () => {
    let resolveSave: ((value: HomeworkAttemptDto) => void) | undefined;
    mocks.saveAnswer.mockImplementationOnce(() => new Promise<HomeworkAttemptDto>(resolve => {
      resolveSave = resolve;
    }));
    const { result } = setup();
    await waitFor(() => expect(result.current.editable).toBe(true));
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Ответ перед сдачей' }));
    let pending: Promise<HomeworkAttemptDto | null> | undefined;
    act(() => {
      pending = result.current.submit();
      result.current.recordAnswer({ questionId: 11, textValue: 'Ввод в той же обработке' });
    });
    await waitFor(() => expect(mocks.saveAnswer).toHaveBeenCalledOnce());
    expect(result.current.submitting).toBe(true);
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Ввод во время запроса' }));
    expect(result.current.answerDraft(11)?.textValue).toBe('Ответ перед сдачей');
    await act(async () => {
      resolveSave?.(homeworkAttempt({ answers: [{ questionId: 11, revision: 1, textValue: 'Ответ перед сдачей', richText: null, selectedOptionIds: [], files: [], annotations: [], score: null, isCorrect: null, teacherComment: null }] }));
      await pending;
    });
    expect(mocks.submit).toHaveBeenCalledWith('school', 'attempt-1', 0);
    expect(mocks.saveAnswer).toHaveBeenCalledOnce();
    expect(result.current.submitting).toBe(false);
    expect(result.current.dirty).toBe(false);
  });

  it('keeps a conflicting tab draft and blocks submission until explicit server reload', async () => {
    mocks.saveAnswer.mockRejectedValue(new AxiosError('Изменено в другой вкладке', '409', undefined, undefined, { status: 409, data: null, statusText: 'Conflict', headers: {}, config: { headers: new (await import('axios')).AxiosHeaders() } }));
    const { result } = setup();
    await waitFor(() => expect(result.current.editable).toBe(true));
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Мой текст' }));
    await act(async () => {
      await result.current.save();
    });
    expect(result.current.conflicted).toEqual([11]);
    expect(result.current.answerDraft(11)?.textValue).toBe('Мой текст');
    await act(async () => {
      await result.current.submit();
    });
    expect(mocks.submit).not.toHaveBeenCalled();
    await act(async () => result.current.discardConflict(11));
    expect(result.current.conflicted).toEqual([]);
    expect(result.current.answerDraft(11)).toBeUndefined();
  });

  it('restores only its pinned version and preserves separate snapshots from different tabs', async () => {
    const base = answerDraftKey('student-1:school', 'attempt-1', 1, 11);
    persistAnswerDraft(`${base}:old-tab`, { questionId: 11, revision: 0, textValue: 'Офлайн', richText: null, selectedOptionIds: [] });
    persistAnswerDraft(`${answerDraftKey('student-1:school', 'attempt-1', 2, 11)}:new-version`, { questionId: 11, revision: 0, textValue: 'Другая версия' });
    const { result } = setup();
    await waitFor(() => expect(result.current.answerDraft(11)?.textValue).toBe('Офлайн'));
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Новая вкладка' }));
    expect(listAnswerDrafts(base)).toHaveLength(2);
    expect(result.current.attempt?.version).toBe(1);
  });

  it('stops editing after the server deadline and never saves teacher-owned attempts', async () => {
    mocks.getAttempt.mockResolvedValue(homeworkAttempt({ forceSubmitAtUtc: '2026-11-17T11:59:00Z' }));
    const { result } = setup();
    await waitFor(() => expect(result.current.seconds).toBe(0));
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Поздно' }));
    expect(result.current.editable).toBe(false);
    expect(result.current.dirty).toBe(false);
    await act(async () => {
      await result.current.save();
    });
    expect(mocks.saveAnswer).not.toHaveBeenCalled();
    cleanup();
    mocks.getAttempt.mockResolvedValue(homeworkAttempt({ student: { publicId: 'other', name: 'Другой', avatarUrl: null } }));
    const next = setup();
    await waitFor(() => expect(next.result.current.attempt).toBeTruthy());
    expect(next.result.current.editable).toBe(false);
  });

  it('synchronizes a fractional-tick server clock and locks exactly at the forced deadline', async () => {
    vi.useFakeTimers();
    const started = Date.parse(HOMEWORK_TEST_TIME);
    vi.setSystemTime(started);
    const { result } = setup();
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.editable).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(750);
    });
    const forced = homeworkAttempt({ serverTimeUtc: new Date(started + 750).toISOString(), forceSubmitAtUtc: new Date(started + 60750).toISOString() });
    mocks.getAttempt.mockResolvedValueOnce(forced);
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.seconds).toBe(60);
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.seconds).toBe(60);
    expect(result.current.attempt?.forceSubmitAtUtc).toBe(forced.forceSubmitAtUtc);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });
    expect(result.current.seconds).toBe(0);
    expect(result.current.editable).toBe(false);
  });

  it('rejects text input after the deadline even before a scheduled clock callback runs', async () => {
    vi.useFakeTimers();
    const started = Date.parse(HOMEWORK_TEST_TIME);
    vi.setSystemTime(started);
    const forced = homeworkAttempt({ forceSubmitAtUtc: new Date(started + 60000).toISOString() });
    mocks.getAttempt.mockResolvedValue(forced);
    mocks.presence.mockResolvedValue(forced);
    const { result } = setup();
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.editable).toBe(true);
    vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 60000);
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Слишком поздно' }));
    expect(result.current.dirty).toBe(false);
    expect(mocks.saveAnswer).not.toHaveBeenCalled();
  });

  it('does not reopen an expired attempt when a delayed newer predeadline response arrives', async () => {
    vi.useFakeTimers();
    const started = Date.parse(HOMEWORK_TEST_TIME);
    vi.setSystemTime(started);
    const first = homeworkAttempt({ forceSubmitAtUtc: new Date(started + 300).toISOString() });
    mocks.getAttempt.mockResolvedValue(first);
    mocks.getAttempt.mockImplementationOnce(() => new Promise<HomeworkAttemptDto>(resolve => {
      window.setTimeout(() => resolve(first), 80);
    }));
    mocks.presence.mockResolvedValue(first);
    const { result } = setup();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(80);
    });
    let finishRead: ((value: HomeworkAttemptDto) => void) | undefined;
    mocks.getAttempt.mockImplementationOnce(() => new Promise<HomeworkAttemptDto>(resolve => {
      finishRead = resolve;
    }));
    let read: Promise<HomeworkAttemptDto | null> | undefined;
    act(() => {
      read = result.current.refresh();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.editable).toBe(false);
    const presenceCalls = mocks.presence.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(38);
      finishRead?.({ ...first, serverTimeUtc: new Date(started + 80).toISOString() });
      await read;
    });
    expect(result.current.seconds).toBe(0);
    expect(result.current.editable).toBe(false);
    expect(mocks.presence).toHaveBeenCalledTimes(presenceCalls);
    act(() => result.current.recordAnswer({ questionId: 11, textValue: 'Поздний ввод' }));
    expect(result.current.dirty).toBe(false);
    await act(async () => {
      expect(await result.current.save()).toBe(false);
    });
    expect(mocks.saveAnswer).not.toHaveBeenCalled();
  });

  it('keeps a predeadline estimate monotonic while allowing initial client clock skew', async () => {
    vi.useFakeTimers();
    const started = Date.parse(HOMEWORK_TEST_TIME);
    vi.setSystemTime(started + 3600000);
    const first = homeworkAttempt({ forceSubmitAtUtc: new Date(started + 60000).toISOString() });
    mocks.getAttempt.mockResolvedValue(first);
    mocks.presence.mockResolvedValue(first);
    const { result } = setup();
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.seconds).toBe(60);
    expect(result.current.editable).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5500);
    });
    expect(result.current.seconds).toBe(55);
    mocks.getAttempt.mockResolvedValue({ ...first, serverTimeUtc: new Date(started + 80).toISOString() });
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.seconds).toBe(55);
    expect(result.current.editable).toBe(true);
  });

  it('completes authorized file upload only after byte transfer and refreshes after removal', async () => {
    const definition = homeworkDefinition({ questions: [homeworkQuestion({ questionType: 4 })] });
    mocks.getAttempt.mockResolvedValue(homeworkAttempt({ homework: definition }));
    mocks.presence.mockResolvedValue(homeworkAttempt({ homework: definition }));
    mocks.presign.mockResolvedValue({ uploadUrl: 'https://storage/upload', storageKey: 'owned' });
    mocks.uploadFileDirect.mockResolvedValue(undefined);
    mocks.completeUpload.mockResolvedValue(homeworkAttempt({ homework: definition }));
    const { result } = setup();
    await waitFor(() => expect(result.current.editable).toBe(true));
    const file = new File(['image'], 'work.png', { type: 'image/png' });
    await act(async () => {
      await result.current.upload(11, file);
    });
    expect(mocks.presign).toHaveBeenCalledWith('school', 'attempt-1', 11, 'work.png', 'checksum');
    expect(mocks.uploadFileDirect).toHaveBeenCalledBefore(mocks.completeUpload);
    expect(mocks.completeUpload).toHaveBeenCalledWith('school', 'attempt-1', expect.objectContaining({ questionId: 11, storageKey: 'owned', tabId: expect.any(String) }));
    await act(async () => {
      await result.current.removeFile(11, 'file-1');
    });
    expect(mocks.removeAnswerFile).toHaveBeenCalledWith('school', 'attempt-1', 11, 'file-1');
    Object.defineProperty(file, 'size', { value: 21 * 1024 * 1024 });
    await act(async () => {
      await result.current.upload(11, file);
    });
    expect(result.current.state.error).toMatch(/20 МБ/);
    expect(mocks.presign).toHaveBeenCalledOnce();
  });
});
