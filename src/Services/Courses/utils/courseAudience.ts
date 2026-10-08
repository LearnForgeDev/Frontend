import type { CourseAccessInput } from '@/Endpoints/courses';
import type { CourseInput } from '../Courses.types';

export function getCourseAudience(input: CourseInput, existingUserIds: string[], studentIds: string[], authorPublicId: string): CourseAccessInput {
  if (input.accessMode === 'school') return { allowedUserPublicIds: [], allowedGroupIds: [] };
  const preservedUsers = existingUserIds.filter(id => !studentIds.includes(id));
  return {
    allowedUserPublicIds: [...new Set([...preservedUsers, ...input.studentPublicIds, authorPublicId])],
    allowedGroupIds: input.groupIds,
  };
}

export function getRestrictedCourseAudience(existing: CourseAccessInput, target: CourseAccessInput, authorPublicId: string): CourseAccessInput | null {
  if (!target.allowedUserPublicIds.length && !target.allowedGroupIds.length) return null;
  if (!existing.allowedUserPublicIds.length && !existing.allowedGroupIds.length) return target;
  const removesUsers = existing.allowedUserPublicIds.some(id => !target.allowedUserPublicIds.includes(id));
  const removesGroups = existing.allowedGroupIds.some(id => !target.allowedGroupIds.includes(id));
  if (!removesUsers && !removesGroups) return null;
  return {
    allowedUserPublicIds: [...new Set([...existing.allowedUserPublicIds.filter(id => target.allowedUserPublicIds.includes(id)), authorPublicId])],
    allowedGroupIds: existing.allowedGroupIds.filter(id => target.allowedGroupIds.includes(id)),
  };
}
