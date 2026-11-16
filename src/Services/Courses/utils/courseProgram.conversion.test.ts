import { describe, expect, it } from 'vitest';
import { makeCourse, makeCourseInput, makeCourseItem, makeSupportedBlock } from './course.fixtures';
import { courseBlockTitle, fromLocalDateTime, isCourseItemAvailable, toCourseBlock, toLocalDateTime } from './courseProgram.conversion';
import { courseFormReducer, createCourseForm } from '../hooks/courseFormReducer';
import { validateCourse } from '../validation/courseValidation';

it('maps all reference types and preserves unknown or malformed blocks', () => {
  const references = [
    makeCourseItem({ itemType: 0, file: { publicId: 'file', fileName: 'Файл', sizeBytes: 1, mimeType: 'image/png' }, lessonId: null }),
    makeCourseItem({ itemType: 1, scheduleEventPublicId: 'event', scheduleEventId: 2, lessonId: null }),
    makeCourseItem({ itemType: 1, scheduleEventId: 2, lessonId: null }),
    makeCourseItem(),
    makeCourseItem({ itemType: 3, homeworkId: 3, lessonId: null }),
  ];
  for (const item of references) {
    const block = toCourseBlock(item);
    expect(block.kind).toBe('supported');
    expect(courseBlockTitle(block)).toBe(item.title);
  }
  const unsupported = toCourseBlock(makeCourseItem({ itemType: 99 }));
  expect(unsupported.kind).toBe('unsupported');
  expect(courseBlockTitle(unsupported)).toBe('Урок');
  expect(toCourseBlock(makeCourseItem({ lessonId: null })).kind).toBe('unsupported');
});

it('uses inclusive start and exclusive end and round-trips local dates', () => {
  const item = { availableFromUtc: '2026-11-17T10:00:00Z', availableUntilUtc: '2026-11-17T11:00:00Z' };
  expect(isCourseItemAvailable(item, Date.parse(item.availableFromUtc) - 1)).toBe(false);
  expect(isCourseItemAvailable(item, Date.parse(item.availableFromUtc))).toBe(true);
  expect(isCourseItemAvailable(item, Date.parse(item.availableUntilUtc))).toBe(false);
  expect(isCourseItemAvailable({ availableFromUtc: null, availableUntilUtc: null })).toBe(true);
  expect(fromLocalDateTime(toLocalDateTime(item.availableFromUtc))).toBe('2026-11-17T10:00:00.000Z');
  expect(toLocalDateTime(null)).toBe('');
  expect(fromLocalDateTime('')).toBeNull();
});

describe('Course form', () => {
  it('keeps stable identities when a partially saved new block receives its server id', () => {
    const form = createCourseForm();
    const initial = { ...form, blocks: [{ ...makeSupportedBlock(), publicId: null }] };
    const saved = courseFormReducer(initial, { type: 'created', clientId: initial.blocks[0].clientId, publicId: 'created' });
    expect(saved.blocks[0].publicId).toBe('created');
    expect(saved.blocks[0].clientId).toBe(initial.blocks[0].clientId);
    expect(saved.sourceItemPublicIds).toEqual(['created']);
    expect(courseFormReducer(saved, { type: 'field', field: 'title', value: ' Новый ' }).title).toBe(' Новый ');
    expect(courseFormReducer(saved, { type: 'blocks', blocks: [] }).blocks).toEqual([]);
    expect(courseFormReducer(saved, { type: 'students', studentPublicIds: ['student'] }).studentPublicIds).toEqual(['student']);
    expect(courseFormReducer(saved, { type: 'groups', groupIds: [2] }).groupIds).toEqual([2]);
    expect(courseFormReducer(saved, { type: 'access', accessMode: 'school' }).accessMode).toBe('school');
    expect(courseFormReducer(saved, { type: 'error', error: 'failure' }).error).toBe('failure');
  });

  it('validates ordered blocks without forbidding duplicate references', () => {
    const input = makeCourseInput();
    input.blocks.push({ ...makeSupportedBlock(), clientId: 'second', publicId: null });
    expect(validateCourse(input)).toBeNull();
    input.blocks[1] = { ...input.blocks[1], clientId: input.blocks[0].clientId };
    expect(validateCourse(input)).toContain('идентификаторы');
    input.blocks.pop();
    const block = input.blocks[0];
    if (block.kind !== 'supported') {
      throw new Error('Fixture must be supported');
    }
    block.input.availableFromUtc = 'invalid';
    expect(validateCourse(input)).toContain('даты');
    block.input.availableFromUtc = '2026-11-17T12:00:00Z';
    block.input.availableUntilUtc = '2026-11-17T10:00:00Z';
    expect(validateCourse(input)).toContain('раньше');
    block.input.title = '';
    expect(validateCourse(input)).toContain('название каждого');
    expect(validateCourse({ ...input, title: '' })).toContain('название курса');
    expect(validateCourse({ ...input, title: 'x'.repeat(161) })).toContain('160');
    expect(validateCourse({ ...input, description: 'x'.repeat(2001) })).toContain('2000');
    expect(validateCourse(makeCourseInput(makeCourse({ items: [makeCourseItem({ itemType: 99 })] })))).toBeNull();
  });
});
