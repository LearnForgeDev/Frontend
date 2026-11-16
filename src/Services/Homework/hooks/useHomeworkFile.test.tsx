import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHomeworkFile } from './useHomeworkFile';
import type { HomeworkFileSource } from '../homework.type';

const mocks = vi.hoisted(() => ({ answerFile: vi.fn(), questionFile: vi.fn() }));
vi.mock('@/Endpoints/Homework/homework', () => ({ homeworkEndpoints: mocks }));
const source = { schoolPublicId: 'school', homeworkPublicId: 'homework', questionId: 11, filePublicId: 'file', isImage: true };

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('URL', class extends URL {
    static override createObjectURL = vi.fn(() => 'blob:private');
    static override revokeObjectURL = vi.fn();
  });
  mocks.questionFile.mockResolvedValue(new Blob(['image'], { type: 'image/png' }));
  mocks.answerFile.mockResolvedValue(new Blob(['image'], { type: 'image/png' }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Homework authorized attachment resources', () => {
  it('loads question content and cancels/revokes its URL when replaced', async () => {
    const initialProps: HomeworkFileSource = source;
    const { result, rerender, unmount } = renderHook(useHomeworkFile, { initialProps });
    await waitFor(() => expect(result.current.url).toBe('blob:private'));
    const signal = mocks.questionFile.mock.calls[0][4];
    rerender({ ...source, attemptPublicId: 'attempt' });
    await waitFor(() => expect(mocks.answerFile).toHaveBeenCalledWith('school', 'attempt', 11, 'file', expect.any(AbortSignal)));
    expect(signal.aborted).toBe(true);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:private');
    unmount();
  });

  it('keeps a failed image distinct from loading and retries the same authorized resource', async () => {
    mocks.questionFile.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useHomeworkFile(source));
    await waitFor(() => expect(result.current.error).toBe(true));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.url).toBe('blob:private'));
    expect(result.current.error).toBe(false);
  });

  it('avoids eager binary downloads for nonimages and releases an explicit download', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { result } = renderHook(() => useHomeworkFile({ ...source, isImage: false }));
    expect(mocks.questionFile).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.download('answer.pdf');
    });
    expect(click).toHaveBeenCalledOnce();
    expect(mocks.questionFile).toHaveBeenCalledWith('school', 'homework', 11, 'file', undefined);
    mocks.questionFile.mockRejectedValue(new Error('forbidden'));
    await act(async () => {
      await result.current.download('answer.pdf');
    });
    expect(result.current.error).toBe(true);
  });
});
