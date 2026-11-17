import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { makeCourse, makeCourseItem } from '../utils/course.fixtures';
import { toCourseDetail } from '../utils/courseMapping';
import { useCoursePage } from './useCoursePage';

const navigate = vi.fn();
const approve = vi.fn(() => Promise.resolve());
const activity = vi.fn(() => Promise.resolve());
const read = vi.fn();
const remove = vi.fn(() => Promise.resolve());
const material = vi.fn(() => Promise.resolve(new Blob(['file'], { type: 'image/png' })));
const refreshHomework = vi.fn();
const getHomeworkPath = vi.fn((): string | null => '/homework/path');
const createUrl = vi.fn(() => 'blob:preview');
const revokeUrl = vi.fn();
function unlockedDetail(course: ReturnType<typeof makeCourse>) {
  const detail = toCourseDetail(course);
  return { ...detail, items: detail.items.map(item => ({ ...item, isUnlocked: true })) };
}
let search = new URLSearchParams();
let query = {
  data: unlockedDetail(makeCourse({ canManage: false })),
  progressQuery: { isSuccess: true }, rosterQuery: {},
  feature: { scope: 'teacher/school', state: { operations: {} }, approve, activity, read, remove, getMaterial: material, getHomeworkPath, homework: { refresh: refreshHomework } },
};
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate, useSearchParams: () => [search] }));
vi.mock('./useCourseQueries', () => ({ useCourseQuery: () => query }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));

beforeEach(() => {
  search = new URLSearchParams();
  vi.stubGlobal('URL', { createObjectURL: createUrl, revokeObjectURL: revokeUrl });
  query = {
    data: unlockedDetail(makeCourse({ canManage: false })),
    progressQuery: { isSuccess: true }, rosterQuery: {},
    feature: { scope: 'teacher/school', state: { operations: {} }, approve, activity, read, remove, getMaterial: material, getHomeworkPath, homework: { refresh: refreshHomework } },
  };
  approve.mockResolvedValue();
  activity.mockResolvedValue();
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
  query.data = unlockedDetail(makeCourse({ items: [makeCourseItem({ publicId: 'repeated', position: 1 })] }));
  rerender();
  expect(result.current.focusItemPublicId).toBe('repeated');
  expect(navigate).not.toHaveBeenCalled();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('opens lesson occurrences, public schedule events and homework with stable context', async () => {
  query.data = unlockedDetail(makeCourse({ canManage: false, items: [
    makeCourseItem(),
    makeCourseItem({ publicId: 'call', itemType: 1, scheduleEventPublicId: 'event-guid' }),
    makeCourseItem({ publicId: 'homework', itemType: 3, homeworkId: 7 }),
  ] }));
  const { result } = renderHook(() => useCoursePage('school', 'course'));
  await act(async () => result.current.openItem(query.data.items[0]));
  expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/courses/course/lessons/10?item=lesson-item');
  await act(async () => result.current.openItem(query.data.items[1]));
  expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/schedule?eventId=event-guid');
  await act(async () => result.current.openItem(query.data.items[2]));
  expect(navigate).toHaveBeenLastCalledWith('/homework/path');
  expect(getHomeworkPath).toHaveBeenCalledWith(7, 'course', 'homework');
  getHomeworkPath.mockReturnValue(null);
  await act(async () => result.current.openItem(query.data.items[2]));
  expect(result.current.openError).toContain('Задание недоступно');
  expect(refreshHomework).toHaveBeenCalled();
  act(() => result.current.setTab('students'));
  expect(result.current.tab).toBe('lessons');
  act(() => result.current.goBack());
  expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/courses');
});

it('loads authorized material bytes, releases preview URLs and handles a failed preview', async () => {
  query.data = unlockedDetail(makeCourse({ items: [makeCourseItem({ itemType: 0, file: { publicId: 'file', fileName: 'Работа.png', sizeBytes: 1, mimeType: 'image/png' } })] }));
  const { result, unmount } = renderHook(() => useCoursePage('school', 'course'));
  await act(async () => result.current.openItem(query.data.items[0]));
  await waitFor(() => expect(result.current.material?.fileName).toBe('Работа.png'));
  expect(material).toHaveBeenCalledWith('course', 'lesson-item');
  act(() => result.current.closeMaterial());
  expect(revokeUrl).toHaveBeenCalledWith('blob:preview');
  expect(result.current.material).toBeNull();
  material.mockRejectedValueOnce(new Error('offline'));
  await act(async () => result.current.openItem(query.data.items[0]));
  await waitFor(() => expect(result.current.openError).toContain('Не удалось открыть'));
  await act(async () => result.current.openItem(query.data.items[0]));
  await waitFor(() => expect(result.current.material).not.toBeNull());
  unmount();
  expect(revokeUrl).toHaveBeenCalledWith('blob:preview');
});

it('discards material responses after unmount and rejects unavailable or unknown actions', async () => {
  let finish: (blob: Blob) => void = () => undefined;
  material.mockImplementationOnce(() => new Promise(resolve => {
    finish = resolve;
  }));
  query.data = unlockedDetail(makeCourse({ canManage: false, items: [
    makeCourseItem({ itemType: 0, file: { publicId: 'file', fileName: 'Файл', sizeBytes: 1, mimeType: null } }),
    makeCourseItem({ publicId: 'future', availableFromUtc: '2999-01-01T10:00:00Z' }),
    makeCourseItem({ publicId: 'unknown', itemType: 99 }),
    makeCourseItem({ publicId: 'legacy-call', itemType: 1, scheduleEventId: 42 }),
  ] }));
  const { result, unmount } = renderHook(() => useCoursePage('school', 'course'));
  await act(async () => result.current.openItem(query.data.items[1]));
  await act(async () => result.current.openItem(query.data.items[2]));
  expect(navigate).not.toHaveBeenCalled();
  await act(async () => result.current.openItem(query.data.items[3]));
  expect(result.current.openError).toContain('Занятие недоступно');
  await act(async () => result.current.openItem(query.data.items[0]));
  unmount();
  await act(async () => finish(new Blob()));
  expect(createUrl).not.toHaveBeenCalled();
});

it('keeps failed teacher approval and deletion visible', async () => {
  const { result } = renderHook(() => useCoursePage('school', 'course'));
  approve.mockRejectedValueOnce(new Error('offline'));
  act(() => result.current.approveItem('student', query.data.items[0], 2));
  await waitFor(() => expect(result.current.progress.isError).toBe(true));
  act(() => result.current.approveItem('student', query.data.items[0], 2));
  await waitFor(() => expect(result.current.progress.isError).toBe(false));
  expect(approve).toHaveBeenLastCalledWith('course', 'student', query.data.items[0], 2);
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

it('keeps a locked lesson closed and rechecks server permission before navigation', async () => {
  query.data = toCourseDetail(makeCourse({ canManage: false }));
  const { result, rerender } = renderHook(() => useCoursePage('school', 'course'));
  await act(async () => result.current.openItem(query.data.items[0]));
  expect(activity).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
  query.data = unlockedDetail(makeCourse({ canManage: false }));
  rerender();
  activity.mockRejectedValueOnce(new Error('locked on server'));
  await act(async () => result.current.openItem(query.data.items[0]));
  expect(navigate).not.toHaveBeenCalled();
  expect(result.current.openError).toContain('Не удалось открыть');
});
