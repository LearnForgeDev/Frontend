import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { coursesEndpoints } from '@/Endpoints/Courses';
import { makeCourse, makeCourseInput, makeCourseItem } from './course.fixtures';
import { saveCourse } from '../hooks/saveCourse';
import { CourseCreationUncertainError } from '../hooks/saveCourse.errors';
import type { SaveCourseOptions } from '../hooks/saveCourse.type';

let persisted = makeCourse();
const onCreated = vi.fn();
const onItemCreated = vi.fn();
function options(overrides: Partial<SaveCourseOptions> = {}): SaveCourseOptions {
  return {
    schoolPublicId: 'school', coursePublicId: 'course', authorPublicId: 'teacher',
    input: makeCourseInput(persisted), studentIds: ['student'], onCreated, onItemCreated, ...overrides,
  };
}

beforeEach(() => {
  persisted = makeCourse();
  onCreated.mockReset();
  onItemCreated.mockReset();
  vi.spyOn(coursesEndpoints, 'getCourse').mockImplementation(() => Promise.resolve(structuredClone(persisted)));
  vi.spyOn(coursesEndpoints, 'createCourse').mockImplementation(() => {
    persisted = makeCourse({ items: [] });
    return Promise.resolve(structuredClone(persisted));
  });
  vi.spyOn(coursesEndpoints, 'updateCourse').mockImplementation((_, __, input) => {
    persisted = { ...persisted, ...input };
    return Promise.resolve(structuredClone(persisted));
  });
  vi.spyOn(coursesEndpoints, 'updateAccess').mockResolvedValue();
  vi.spyOn(coursesEndpoints, 'updateItem').mockImplementation((_, __, publicId, input) => {
    const item = persisted.items.find(candidate => candidate.publicId === publicId);
    if (!item) {
      throw new Error('Missing item');
    }
    const updated = { ...item, ...input };
    persisted.items = persisted.items.map(candidate => candidate.publicId === publicId ? updated : candidate);
    return Promise.resolve(updated);
  });
  vi.spyOn(coursesEndpoints, 'addItem').mockImplementation((_, __, input) => {
    const item = makeCourseItem({ ...input, publicId: `new-${persisted.items.length}` });
    persisted.items.push(item);
    return Promise.resolve(item);
  });
  vi.spyOn(coursesEndpoints, 'removeItem').mockImplementation((_, __, id) => {
    persisted.items = persisted.items.filter(item => item.publicId !== id);
    return Promise.resolve();
  });
  vi.spyOn(coursesEndpoints, 'moveItem').mockResolvedValue();
});

describe('Mixed course saves', () => {
  it('keeps duplicate source references as distinct items and orders by item identity', async () => {
    persisted.items.push(makeCourseItem({ publicId: 'repeat', position: 1 }));
    const input = makeCourseInput(persisted);
    input.blocks.reverse();
    await saveCourse(options({ input }));
    expect(coursesEndpoints.addItem).not.toHaveBeenCalled();
    expect(coursesEndpoints.removeItem).not.toHaveBeenCalled();
    expect(coursesEndpoints.moveItem).toHaveBeenCalledWith('school', 'course', 'repeat', 0);
    expect(coursesEndpoints.updateItem).toHaveBeenCalledTimes(2);
  });

  it('adds all supported references without granting source access and keeps created identity', async () => {
    const input = makeCourseInput(makeCourse({ items: [] }));
    const fields = { title: 'Блок', description: null, isRequired: false, availableFromUtc: null, availableUntilUtc: null };
    input.blocks = [
      { kind: 'supported', clientId: 'file', publicId: null, input: { ...fields, itemType: 0, filePublicId: 'file' } },
      { kind: 'supported', clientId: 'call', publicId: null, input: { ...fields, itemType: 1, scheduleEventPublicId: 'event-guid' } },
      { kind: 'supported', clientId: 'lesson', publicId: null, input: { ...fields, itemType: 2, lessonId: 10 } },
      { kind: 'supported', clientId: 'homework', publicId: null, input: { ...fields, itemType: 3, homeworkId: 7 } },
    ];
    const result = await saveCourse(options({ coursePublicId: undefined, input }));
    expect(onCreated).toHaveBeenCalledOnce();
    expect(onItemCreated).toHaveBeenCalledTimes(4);
    expect(result.items).toHaveLength(4);
    expect(coursesEndpoints.createCourse).toHaveBeenCalledWith('school', expect.objectContaining({ allowedUserPublicIds: ['teacher'] }));
    expect(coursesEndpoints.addItem).toHaveBeenCalledWith('school', 'course', expect.objectContaining({ itemType: 1, scheduleEventPublicId: 'event-guid' }));
    expect(coursesEndpoints.updateAccess).toHaveBeenLastCalledWith('school', 'course', { allowedUserPublicIds: ['teacher'], allowedGroupIds: [] });
  });

  it('retains unknown item payloads and removes only deliberately removed blocks', async () => {
    const unknown = makeCourseItem({ publicId: 'unknown', itemType: 99, lessonId: null, position: 1 });
    persisted.items.push(unknown);
    const input = makeCourseInput(persisted);
    input.blocks = input.blocks.filter(block => block.publicId === 'unknown');
    await saveCourse(options({ input }));
    expect(coursesEndpoints.updateItem).not.toHaveBeenCalled();
    expect(coursesEndpoints.removeItem).toHaveBeenCalledWith('school', 'course', 'lesson-item');
    expect(persisted.items).toEqual([unknown]);
  });

  it('rejects concurrent program additions before any write', async () => {
    const input = makeCourseInput(persisted);
    persisted.items.push(makeCourseItem({ publicId: 'other-editor', position: 1 }));
    await expect(saveCourse(options({ input }))).rejects.toThrow('Программа изменилась');
    expect(coursesEndpoints.updateCourse).not.toHaveBeenCalled();
  });

  it('does not create again after an uncertain create or item-create response', async () => {
    vi.mocked(coursesEndpoints.createCourse).mockRejectedValueOnce(new Error('offline'));
    await expect(saveCourse(options({ coursePublicId: undefined, input: makeCourseInput(makeCourse({ items: [] })) }))).rejects.toBeInstanceOf(CourseCreationUncertainError);
    expect(onCreated).not.toHaveBeenCalled();
    const input = makeCourseInput(persisted);
    input.blocks.push({ kind: 'supported', publicId: null, clientId: 'new', input: { title: 'Новое', description: null, itemType: 2, lessonId: 20, isRequired: true, availableFromUtc: null, availableUntilUtc: null } });
    vi.mocked(coursesEndpoints.addItem).mockRejectedValueOnce(new Error('lost response'));
    await expect(saveCourse(options({ input }))).rejects.toBeInstanceOf(CourseCreationUncertainError);
    expect(onItemCreated).not.toHaveBeenCalled();
  });

  it('keeps definite backend rejections retryable and checks course permission', async () => {
    const rejection = new AxiosError('invalid');
    rejection.response = { status: 400, data: '', statusText: '', headers: {}, config: { headers: new AxiosHeaders() } };
    vi.mocked(coursesEndpoints.createCourse).mockRejectedValueOnce(rejection);
    await expect(saveCourse(options({ coursePublicId: undefined }))).rejects.toBe(rejection);
    persisted.canManage = false;
    await expect(saveCourse(options())).rejects.toThrow('Нет доступа');
    expect(coursesEndpoints.updateCourse).not.toHaveBeenCalled();
    await expect(saveCourse(options({ authorPublicId: '' }))).rejects.toThrow('Войдите');
  });

  it('narrows old audience before program edits and expands only after success', async () => {
    persisted.allowedUserPublicIds = ['teacher', 'old'];
    const input = { ...makeCourseInput(persisted), studentPublicIds: ['student'] };
    vi.mocked(coursesEndpoints.updateItem).mockRejectedValueOnce(new Error('write failed'));
    await expect(saveCourse(options({ input, studentIds: ['old', 'student'] }))).rejects.toThrow('write failed');
    expect(coursesEndpoints.updateAccess).toHaveBeenCalledOnce();
    expect(coursesEndpoints.updateAccess).toHaveBeenCalledWith('school', 'course', { allowedUserPublicIds: ['teacher'], allowedGroupIds: [] });
  });
});
