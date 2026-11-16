import type { CourseFormAction } from './courseFormReducer.type';
import type { CourseDetail, CourseFormState, CourseInput } from '../Courses.type';

export function createCourseForm(course?: CourseDetail): CourseFormState {
  return {
    title: course?.title ?? '',
    description: course?.description ?? '',
    blocks: course?.items.map(item => item.block) ?? [],
    sourceItemPublicIds: course?.items.map(item => item.publicId) ?? [],
    studentPublicIds: course?.raw.allowedUserPublicIds ?? [],
    groupIds: course?.raw.allowedGroupIds ?? [],
    accessMode: course && !course.raw.allowedUserPublicIds?.length && !course.raw.allowedGroupIds.length ? 'school' : 'selected',
    error: null,
  };
}

export function courseFormReducer(state: CourseFormState, action: CourseFormAction): CourseFormState {
  switch (action.type) {
    case 'field':
      return { ...state, [action.field]: action.value, error: null };
    case 'blocks':
      return { ...state, blocks: action.blocks, error: null };
    case 'created':
      return {
        ...state,
        sourceItemPublicIds: [...state.sourceItemPublicIds, action.publicId],
        blocks: state.blocks.map(block => block.clientId === action.clientId ? { ...block, publicId: action.publicId } : block),
      };
    case 'students':
      return { ...state, studentPublicIds: action.studentPublicIds, error: null };
    case 'groups':
      return { ...state, groupIds: action.groupIds, error: null };
    case 'access':
      return { ...state, accessMode: action.accessMode, error: null };
    case 'error':
      return { ...state, error: action.error };
  }
}

export function getCourseInput(state: CourseFormState): CourseInput {
  return {
    title: state.title.trim(), description: state.description.trim(),
    blocks: state.blocks, sourceItemPublicIds: state.sourceItemPublicIds,
    studentPublicIds: state.studentPublicIds, groupIds: state.groupIds, accessMode: state.accessMode,
  };
}
