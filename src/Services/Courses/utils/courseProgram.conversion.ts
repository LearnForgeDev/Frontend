import type { CourseItemDto, CourseItemUpdateInput } from '@/Endpoints/Courses';
import type { CourseBlock } from '../Courses.type';

export function toCourseBlock(item: CourseItemDto): CourseBlock {
  const fields = {
    title: item.title, description: item.description, isRequired: item.isRequired,
    availableFromUtc: item.availableFromUtc, availableUntilUtc: item.availableUntilUtc,
  };
  let input: CourseItemUpdateInput;
  if (item.itemType === 0 && item.file) {
    input = { ...fields, itemType: 0, filePublicId: item.file.publicId };
  } else if (item.itemType === 1 && item.scheduleEventPublicId) {
    input = { ...fields, itemType: 1, scheduleEventPublicId: item.scheduleEventPublicId };
  } else if (item.itemType === 1 && item.scheduleEventId !== null) {
    input = { ...fields, itemType: 1, scheduleEventId: item.scheduleEventId };
  } else if (item.itemType === 2 && item.lessonId !== null) {
    input = { ...fields, itemType: 2, lessonId: item.lessonId };
  } else if (item.itemType === 3 && item.homeworkId !== null) {
    input = { ...fields, itemType: 3, homeworkId: item.homeworkId };
  } else {
    return { kind: 'unsupported', clientId: item.publicId, publicId: item.publicId, original: item };
  }
  return { kind: 'supported', clientId: item.publicId, publicId: item.publicId, input };
}

export function isCourseItemAvailable(item: { availableFromUtc: string | null; availableUntilUtc: string | null }, now = Date.now()) {
  return (!item.availableFromUtc || Date.parse(item.availableFromUtc) <= now)
    && (!item.availableUntilUtc || now < Date.parse(item.availableUntilUtc));
}

export function toLocalDateTime(value: string | null) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function fromLocalDateTime(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function courseBlockTitle(block: CourseBlock) {
  return block.kind === 'supported' ? block.input.title : block.original.title;
}
