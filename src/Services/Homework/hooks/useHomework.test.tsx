import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { createApplicationStore } from '@/Storage/Application/application.store';
import { homeworkActions } from '@/Storage/Homework/homework.slice';
import { homeworkDefinition, homeworkQuestion } from '../homework.testUtils';
import { useHomework } from './useHomework';

const mocks = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), access: vi.fn(), draft: vi.fn(), publish: vi.fn(), cancelQueue: vi.fn(), saveQuestion: vi.fn(), removeQuestion: vi.fn(), order: vi.fn(), forceFinish: vi.fn(), attachQuestionFile: vi.fn(), removeQuestionFile: vi.fn(), uploadFileDirectPipeline: vi.fn() }));
vi.mock('@/Endpoints/Homework/homework', () => ({ homeworkEndpoints: mocks }));
vi.mock('@/Endpoints/files/files.endpoints', () => ({ filesEndpoints: mocks }));
vi.mock('@/Services/Auth/hooks/useUser', () => ({ useUser: () => ({ user: { userPublicId: 'teacher' } }) }));

function setup(path = '/school/homework-1', store = createApplicationStore()) {
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}><MemoryRouter initialEntries={[path]}><Routes><Route path="/:schoolPublicId/:homeworkPublicId?" element={children} /></Routes></MemoryRouter></Provider>;
  return { store, ...renderHook(() => useHomework({ draft: true }), { wrapper }) };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.list.mockResolvedValue([homeworkDefinition()]);
  mocks.get.mockResolvedValue(homeworkDefinition({ canManage: true, canEditDefinition: true, draftVersion: 1 }));
});
afterEach(cleanup);

describe('Homework public authoring hook', () => {
  it('reloads a ready catalogue on revisit and focus while preserving current question drafts', async () => {
    const first = setup();
    await waitFor(() => expect(first.result.current.homeworks).toHaveLength(1));
    first.unmount();
    mocks.list.mockResolvedValue([homeworkDefinition(), homeworkDefinition({ publicId: 'new-assignment' })]);
    const second = setup('/school/homework-1', first.store);
    await waitFor(() => expect(second.result.current.homeworks).toHaveLength(2));
    expect(mocks.list).toHaveBeenCalledTimes(2);
    act(() => {
      first.store.dispatch(homeworkActions.questionDraftChanged({ scope: 'teacher:school', key: 'homework-1:1:11', question: { ...homeworkQuestion({ text: 'Несохранённый вопрос' }), options: [] } }));
    });
    mocks.list.mockResolvedValue([homeworkDefinition({ title: 'Обновлено другим преподавателем' })]);
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    await waitFor(() => expect(second.result.current.homeworks[0].title).toBe('Обновлено другим преподавателем'));
    expect(mocks.list).toHaveBeenCalledTimes(3);
    expect(second.result.current.state.questionDrafts['homework-1:1:11'].text).toBe('Несохранённый вопрос');
  });
  it('loads list and draft, creates metadata, saves explicit audiences and preserves public IDs', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.definition).toBeTruthy());
    expect(mocks.get).toHaveBeenCalledWith('school', 'homework-1', true);
    expect(result.current.homeworks[0].publicId).toBe('homework-1');
    const metadata = { title: 'Новое', description: null, passingScore: 1, maxAttempts: null, deadlineUtc: null };
    mocks.create.mockResolvedValue(homeworkDefinition());
    await act(async () => {
      await result.current.create({ ...metadata, allowedUserPublicIds: [], allowedGroupIds: [] });
      await result.current.metadata(metadata);
      await result.current.access({ allowedUserPublicIds: ['student'], allowedGroupIds: [3] });
    });
    expect(mocks.update).toHaveBeenCalledWith('school', 'homework-1', metadata);
    expect(mocks.access).toHaveBeenCalledWith('school', 'homework-1', { allowedUserPublicIds: ['student'], allowedGroupIds: [3] });
    expect(result.current.busy).toBe(false);
  });

  it('fixes and queues versions, cancels publication and arms selected force-finish', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.definition).toBeTruthy());
    mocks.draft.mockResolvedValue(homeworkDefinition({ draftVersion: 2, version: 2 }));
    mocks.publish.mockResolvedValue(homeworkDefinition({ publicationState: 'Queued', queuedVersion: 2 }));
    mocks.cancelQueue.mockResolvedValue(homeworkDefinition({ draftVersion: 2 }));
    await act(async () => {
      await result.current.beginDraft();
      await result.current.publish();
      await result.current.cancelQueue();
      await result.current.forceFinish('selected-attempt');
    });
    expect(mocks.publish).toHaveBeenCalledWith('school', 'homework-1');
    expect(mocks.cancelQueue).toHaveBeenCalledWith('school', 'homework-1');
    expect(mocks.forceFinish).toHaveBeenCalledWith('school', 'selected-attempt');
  });

  it('validates question writes and delegates ordered identities and deletion', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.definition).toBeTruthy());
    const question = { ...homeworkQuestion(), options: [] };
    mocks.saveQuestion.mockResolvedValue(homeworkQuestion());
    await act(async () => {
      await result.current.saveQuestion(null, { ...question, text: ' ' });
    });
    expect(mocks.saveQuestion).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/текст/);
    await act(async () => {
      await result.current.saveQuestion(null, question);
      await result.current.saveQuestion(11, question);
      await result.current.reorder([12, 11]);
      await result.current.removeQuestion(11);
      await result.current.remove('homework-1');
    });
    expect(mocks.saveQuestion).toHaveBeenCalledWith('school', 'homework-1', 11, question);
    expect(mocks.order).toHaveBeenCalledWith('school', 'homework-1', [12, 11]);
    expect(mocks.removeQuestion).toHaveBeenCalledWith('school', 'homework-1', 11);
    expect(mocks.remove).toHaveBeenCalledWith('school', 'homework-1');
  });

  it('uses the owned homework image bucket, refuses oversized input and keeps failed operations visible', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.definition).toBeTruthy());
    mocks.uploadFileDirectPipeline.mockResolvedValue({ publicId: 'image-1' });
    const file = new File(['png'], 'question.png', { type: 'image/png' });
    await act(async () => {
      await result.current.uploadQuestionImage(11, file, 0);
      await result.current.removeQuestionImage(11, 'image-1');
    });
    expect(mocks.uploadFileDirectPipeline).toHaveBeenCalledWith('school', file, 'question.png', 'homework');
    expect(mocks.attachQuestionFile).toHaveBeenCalledWith('school', 'homework-1', 11, 'image-1', 0, 'question.png');
    expect(mocks.removeQuestionFile).toHaveBeenCalledWith('school', 'homework-1', 11, 'image-1');
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
    await act(async () => {
      await result.current.uploadQuestionImage(11, file, 0);
    });
    expect(result.current.error).toMatch(/10 МБ/);
    mocks.publish.mockRejectedValue(new Error('Нет доступа к публикации'));
    await act(async () => {
      await result.current.publish();
    });
    expect(result.current.error).toBe('Нет доступа к публикации');
  });
});
