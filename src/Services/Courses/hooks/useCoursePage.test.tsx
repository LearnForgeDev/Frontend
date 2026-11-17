import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { makeCourse, makeCourseItem } from '../utils/course.fixtures';
import { toCourseDetail } from '../utils/courseMapping';
import { useCoursePage } from './useCoursePage';

const navigate = vi.fn();
const mark = vi.fn(() => Promise.resolve());
const remove = vi.fn(() => Promise.resolve());
const material = vi.fn(() => Promise.resolve(new Blob(['file'], { type: 'image/png' })));
const refreshHomework = vi.fn();
const getHomeworkPath = vi.fn((): string | null => '/homework/path');
const createUrl = vi.fn(() => 'blob:preview');
const revokeUrl = vi.fn();
let search = new URLSearchParams();
let query = {
  data: toCourseDetail(makeCourse({ canManage: false })),
  progressQuery: { isSuccess: true }, rosterQuery: {},
  feature: { scope: 'teacher/school', state: { operations: {} }, mark, remove, getMaterial: material, getHomeworkPath, homework: { refresh: refreshHomework } },
};
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate, useSearchParams: () => [search] }));
vi.mock('./useCourseQueries', () => ({ useCourseQuery: () => query }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));

beforeEach(() => {
  search = new URLSearchParams();
  vi.stubGlobal('URL', { createObjectURL: createUrl, revokeObjectURL: revokeUrl });
  query = {
    data: toCourseDetail(makeCourse({ canManage: false })),
    progressQuery: { isSuccess: true }, rosterQuery: {},
    feature: { scope: 'teacher/school', state: { operations: {} }, mark, remove, getMaterial: material, getHomeworkPath, homework: { refresh: refreshHomework } },
  };
  mark.mockResolvedValue();
  remove.mockResolvedValue();
  material.mockResolvedValue(new Blob(['file'], { type: 'image/png' }));
  getHomeworkPath.mockReturnValue('/homework/path');
});

it('exposes the stable return item from the URL without changing its context during refresh', () => {
  const { result, rerender } = renderHook(() => useCoursePage('school', 'course'));
  expect(result.current.focusItemPublicId).toBeUndefined();
  search = new URLSearchParams('item=repeated');
  rerender();
  expect(result.current.focusItemPublicId).toBe('repeated');
  query.data = toCourseDetail(makeCourse({ items: [makeCourseItem({ publicId: 'repeated', position: 1 })] }));
  rerender();
  expect(result.current.focusItemPublicId).toBe('repeated');
  expect(navigate).not.toHaveBeenCalled();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('opens lesson occurrences, public schedule events and homework with stable context', () => {
  query.data = toCourseDetail(makeCourse({ canManage: false, items: [
    makeCourseItem(),
    makeCourseItem({ publicId: 'call', itemType: 1, scheduleEventPublicId: 'event-guid' }),
    makeCourseItem({ publicId: 'homework', itemType: 3, homeworkId: 7 }),
  ] }));
  const { result } = renderHook(() => useCoursePage('school', 'course'));
  act(() => result.current.openItem(query.data.items[0]));
  expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/courses/course/lessons/10?item=lesson-item');
  act(() => result.current.openItem(query.data.items[1]));
  expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/schedule?eventId=event-guid');
  act(() => result.current.openItem(query.data.items[2]));
  expect(navigate).toHaveBeenLastCalledWith('/homework/path');
  expect(getHomeworkPath).toHaveBeenCalledWith(7, 'course', 'homework');
  getHomeworkPath.mockReturnValue(null);
  act(() => result.current.openItem(query.data.items[2]));
  expect(result.current.openError).toContain('Задание недоступно');
  expect(refreshHomework).toHaveBeenCalled();
  act(() => result.current.setTab('students'));
  expect(result.current.tab).toBe('lessons');
  act(() => result.current.goBack());
  expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/courses');
});

it('loads authorized material bytes, releases preview URLs and handles a failed preview', async () => {
  query.data = toCourseDetail(makeCourse({ items: [makeCourseItem({ itemType: 0, file: { publicId: 'file', fileName: 'Работа.png', sizeBytes: 1, mimeType: 'image/png' } })] }));
  const { result, unmount } = renderHook(() => useCoursePage('school', 'course'));
  act(() => result.current.openItem(query.data.items[0]));
  await waitFor(() => expect(result.current.material?.fileName).toBe('Работа.png'));
  expect(material).toHaveBeenCalledWith('course', 'lesson-item');
  act(() => result.current.closeMaterial());
  expect(revokeUrl).toHaveBeenCalledWith('blob:preview');
  expect(result.current.material).toBeNull();
  material.mockRejectedValueOnce(new Error('offline'));
  act(() => result.current.openItem(query.data.items[0]));
  await waitFor(() => expect(result.current.openError).toContain('Не удалось открыть'));
  act(() => result.current.openItem(query.data.items[0]));
  await waitFor(() => expect(result.current.material).not.toBeNull());
  unmount();
  expect(revokeUrl).toHaveBeenCalledWith('blob:preview');
});

it('discards material responses after unmount and rejects unavailable or unknown actions', async () => {
  let finish: (blob: Blob) => void = () => undefined;
  material.mockImplementationOnce(() => new Promise(resolve => {
    finish = resolve;
  }));
  query.data = toCourseDetail(makeCourse({ canManage: false, items: [
    makeCourseItem({ itemType: 0, file: { publicId: 'file', fileName: 'Файл', sizeBytes: 1, mimeType: null } }),
    makeCourseItem({ publicId: 'future', availableFromUtc: '2999-01-01T10:00:00Z' }),
    makeCourseItem({ publicId: 'unknown', itemType: 99 }),
    makeCourseItem({ publicId: 'legacy-call', itemType: 1, scheduleEventId: 42 }),
  ] }));
  const { result, unmount } = renderHook(() => useCoursePage('school', 'course'));
  act(() => result.current.openItem(query.data.items[1]));
  act(() => result.current.openItem(query.data.items[2]));
  expect(navigate).not.toHaveBeenCalled();
  act(() => result.current.openItem(query.data.items[3]));
  expect(result.current.openError).toContain('Занятие недоступно');
  act(() => result.current.openItem(query.data.items[0]));
  unmount();
  await act(async () => finish(new Blob()));
  expect(createUrl).not.toHaveBeenCalled();
});

it('keeps failed progress and deletion visible and prevents manual homework changes', async () => {
  const { result } = renderHook(() => useCoursePage('school', 'course'));
  mark.mockRejectedValueOnce(new Error('offline'));
  act(() => result.current.markItem(query.data.items[0]));
  await waitFor(() => expect(result.current.progress.isError).toBe(true));
  act(() => result.current.markItem(query.data.items[0]));
  await waitFor(() => expect(result.current.progress.isError).toBe(false));
  const homework = toCourseDetail(makeCourse({ items: [makeCourseItem({ itemType: 3, homeworkId: 7 })] })).items[0];
  act(() => result.current.markItem(homework));
  expect(mark).toHaveBeenCalledTimes(2);
  query.progressQuery.isSuccess = false;
  act(() => result.current.markItem(query.data.items[0]));
  expect(mark).toHaveBeenCalledTimes(2);
  remove.mockRejectedValueOnce(new Error('offline'));
  act(() => result.current.deleteCourse());
  await waitFor(() => expect(result.current.remove.isError).toBe(true));
  act(() => result.current.deleteCourse());
  await waitFor(() => expect(navigate).toHaveBeenCalledWith('/app/schools/school/courses'));
  act(() => result.current.setDialog('edit'));
  expect(result.current.dialog).toBe('edit');
  act(() => result.current.closeDialog());
  expect(result.current.dialog).toBeNull();
});
