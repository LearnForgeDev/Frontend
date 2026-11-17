import { isAxiosError } from 'axios';
import { coursesEndpoints } from '@/Endpoints/Courses';
import type { CourseDto } from '@/Endpoints/Courses';
import { HTTP_STATUS } from '@/Endpoints/factory/factory.const';
import type { SaveCourseOptions } from './saveCourse.type';
import { CourseCreationUncertainError } from './saveCourse.errors';
import { getCourseAudience, getRestrictedCourseAudience } from '../utils/courseAudience';

function isRejectedWrite(error: unknown) {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  return status !== undefined && status >= HTTP_STATUS.BAD_REQUEST && status < HTTP_STATUS.SERVER_ERROR;
}

export async function saveCourse({ schoolPublicId, coursePublicId, authorPublicId, input, studentIds, onCreated, onItemCreated }: SaveCourseOptions) {
  if (!authorPublicId) {
    throw new Error('Войдите в аккаунт заново');
  }
  const metadata = { title: input.title, description: input.description };
  let current: CourseDto;
  if (coursePublicId) {
    current = await coursesEndpoints.getCourse(schoolPublicId, coursePublicId);
    if (!current.canManage) {
      throw new Error('Нет доступа к изменению курса');
    }
  } else {
    try {
      current = await coursesEndpoints.createCourse(schoolPublicId, { ...metadata, allowedUserPublicIds: [authorPublicId], allowedGroupIds: [] });
    } catch (error) {
      if (isRejectedWrite(error)) {
        throw error;
      }
      throw new CourseCreationUncertainError();
    }
    onCreated(current);
  }
  const publicId = current.publicId;
  const knownIds = new Set(input.sourceItemPublicIds);
  if (current.items.some(item => !knownIds.has(item.publicId)) || input.blocks.some(block => block.publicId && !current.items.some(item => item.publicId === block.publicId))) {
    throw new Error('Программа изменилась. Откройте курс заново.');
  }
  const audience = getCourseAudience(input, current.allowedUserPublicIds ?? [], studentIds, authorPublicId);
  const restricted = coursePublicId ? getRestrictedCourseAudience({
    allowedUserPublicIds: current.allowedUserPublicIds ?? [], allowedGroupIds: current.allowedGroupIds,
  }, audience, authorPublicId) : null;
  if (restricted) {
    await coursesEndpoints.updateAccess(schoolPublicId, publicId, restricted);
  }
  await coursesEndpoints.updateCourse(schoolPublicId, publicId, metadata);
  const desiredIds: string[] = [];
  let nextPosition = current.items.reduce((position, item) => Math.max(position, item.position + 1), 0);
  for (const block of input.blocks) {
    if (block.kind === 'unsupported') {
      desiredIds.push(block.publicId);
    } else if (block.publicId) {
      await coursesEndpoints.updateItem(schoolPublicId, publicId, block.publicId, block.input);
      desiredIds.push(block.publicId);
    } else {
      try {
        const created = await coursesEndpoints.addItem(schoolPublicId, publicId, { ...block.input, position: nextPosition++ });
        desiredIds.push(created.publicId);
        onItemCreated(block.clientId, created.publicId);
      } catch (error) {
        if (isRejectedWrite(error)) {
          throw error;
        }
        throw new CourseCreationUncertainError('Ответ о создании блока не получен. Закройте редактор и обновите курс перед продолжением.');
      }
    }
  }
  for (const item of current.items.filter(item => !desiredIds.includes(item.publicId))) {
    await coursesEndpoints.removeItem(schoolPublicId, publicId, item.publicId);
  }
  const refreshed = await coursesEndpoints.getCourse(schoolPublicId, publicId);
  if (refreshed.items.some(item => !desiredIds.includes(item.publicId))) {
    throw new Error('Программа изменилась во время сохранения. Обновите курс.');
  }
  const ordered = [...refreshed.items].sort((a, b) => a.position - b.position);
  for (const [position, itemPublicId] of desiredIds.entries()) {
    const index = ordered.findIndex(item => item.publicId === itemPublicId);
    const item = ordered[index];
    if (!item) {
      throw new Error('Не удалось сохранить программу. Обновите курс.');
    }
    if (index !== position || item.position !== position) {
      await coursesEndpoints.moveItem(schoolPublicId, publicId, itemPublicId, position);
      ordered.splice(index, 1);
      ordered.splice(position, 0, item);
      ordered.forEach((entry, order) => {
        entry.position = order;
      });
    }
  }
  await coursesEndpoints.updateAccess(schoolPublicId, publicId, audience);
  return coursesEndpoints.getCourse(schoolPublicId, publicId);
}
