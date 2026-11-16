import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeCourse, makeCourseInput, makeSupportedBlock } from '../utils/course.fixtures';
import { toCourseDetail } from '../utils/courseMapping';
import { CourseCreationUncertainError } from './saveCourse.errors';
import { useCourseEditor } from './useCourseEditor';

const { save, read, toastError, toastSuccess } = vi.hoisted(() => ({ save: vi.fn(), read: vi.fn(), toastError: vi.fn(), toastSuccess: vi.fn() }));
vi.mock('./useCourses', () => ({ useCourses: () => ({
  read, save, resources: [],
  state: { requests: { options: { status: 'success' } }, options: { students: [], groups: [] }, operations: {} },
  homework: { status: 'ready', refresh: vi.fn() },
}) }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ error: toastError, success: toastSuccess }) }));

afterEach(cleanup);
beforeEach(() => {
  save.mockReset();
  read.mockReset();
});

describe('Course editor recovery', () => {
  it('keeps form input on failed save and retries with a known course identity', async () => {
    save.mockImplementationOnce(async (_, __, created) => {
      created('known-course');
      throw new Error('Сеть недоступна');
    });
    save.mockResolvedValueOnce(toCourseDetail(makeCourse()));
    const onSaved = vi.fn();
    const { result } = renderHook(() => useCourseEditor('school', onSaved));
    act(() => result.current.setField('title', 'Мой курс'));
    act(() => result.current.setBlocks(makeCourseInput().blocks));
    await act(() => result.current.submit());
    expect(result.current.form.title).toBe('Мой курс');
    expect(result.current.isSaveBlocked).toBe(false);
    expect(result.current.errorMessage).toBe('Сеть недоступна');
    expect(onSaved).not.toHaveBeenCalled();
    await act(() => result.current.submit());
    expect(save.mock.calls[1][1]).toBe('known-course');
    expect(onSaved).toHaveBeenCalledOnce();
    expect(toastSuccess).toHaveBeenCalled();
  });

  it('retains created block identifiers and prevents automatic retry after unknown creation', async () => {
    const block = makeSupportedBlock();
    save.mockImplementationOnce(async (_, __, ___, createdItem) => {
      createdItem(block.clientId, 'server-item');
      throw new CourseCreationUncertainError();
    });
    const { result } = renderHook(() => useCourseEditor('school', vi.fn()));
    act(() => result.current.setField('title', 'Курс'));
    act(() => result.current.setBlocks([{ ...block, publicId: null }]));
    await act(() => result.current.submit());
    expect(result.current.form.blocks[0].publicId).toBe('server-item');
    expect(result.current.isSaveBlocked).toBe(true);
    await act(() => result.current.submit());
    expect(save).toHaveBeenCalledOnce();
  });

  it('validates before writes and changes audience through form operations', async () => {
    const { result } = renderHook(() => useCourseEditor('school', vi.fn()));
    await act(() => result.current.submit());
    expect(save).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toContain('название');
    act(() => result.current.setStudents(['student']));
    act(() => result.current.setGroups([2]));
    act(() => result.current.setAccessMode('school'));
    expect(result.current.form.studentPublicIds).toEqual(['student']);
    expect(result.current.form.groupIds).toEqual([2]);
    expect(result.current.form.accessMode).toBe('school');
    act(() => result.current.retry());
    await waitFor(() => expect(read).toHaveBeenCalledWith({ kind: 'options', refresh: true }));
  });
});
