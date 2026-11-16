import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CourseDto, CourseProgressDto } from '@/Endpoints/Courses';
import type { CourseRequestStatus, CoursesState } from './courses.type';
import { courseRequestKey, fetchCourseResource } from './courses.requests';

export const createCoursesState = (scope = ''): CoursesState => ({
  scope, accessEpoch: 0, catalogue: null, details: {}, progress: {}, rosters: {}, lessons: {},
  options: null, requests: {}, operations: {},
});

const coursesSlice = createSlice({
  name: 'courses', initialState: createCoursesState(),
  reducers: {
    scopeChanged: (state, action: PayloadAction<string>) => state.scope === action.payload ? state : createCoursesState(action.payload),
    operationChanged(state, action: PayloadAction<{ scope: string; key: string; pending: boolean }>) {
      if (state.scope === action.payload.scope) {
        state.operations[action.payload.key] = action.payload.pending;
      }
    },
    courseSaved(state, action: PayloadAction<{ scope: string; accessEpoch: number; course: CourseDto }>) {
      if (state.scope !== action.payload.scope || state.accessEpoch !== action.payload.accessEpoch) {
        return;
      }
      const course = action.payload.course;
      state.details[course.publicId] = course;
      if (state.catalogue) {
        const index = state.catalogue.findIndex(existing => existing.publicId === course.publicId);
        if (index < 0) {
          state.catalogue.push(course);
        } else {
          state.catalogue[index] = course;
        }
      }
    },
    courseRemoved(state, action: PayloadAction<{ scope: string; accessEpoch: number; publicId: string }>) {
      if (state.scope !== action.payload.scope || state.accessEpoch !== action.payload.accessEpoch) {
        return;
      }
      const publicId = action.payload.publicId;
      state.catalogue = state.catalogue?.filter(course => course.publicId !== publicId) ?? null;
      delete state.details[publicId];
      delete state.progress[publicId];
      delete state.rosters[publicId];
    },
    progressSaved(state, action: PayloadAction<{ scope: string; accessEpoch: number; progress: CourseProgressDto }>) {
      if (state.scope === action.payload.scope && state.accessEpoch === action.payload.accessEpoch) {
        state.progress[action.payload.progress.coursePublicId] = action.payload.progress;
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchCourseResource.pending, (state, action) => {
      if (state.scope === action.meta.arg.scope) {
        state.requests[courseRequestKey(action.meta.arg)] = { status: 'pending', requestId: action.meta.requestId };
      }
    });
    builder.addCase(fetchCourseResource.fulfilled, (state, action) => {
      const key = courseRequestKey(action.meta.arg);
      const request = state.requests[key];
      if (state.scope !== action.meta.arg.scope || request?.status !== 'pending' || request.requestId !== action.meta.requestId) {
        return;
      }
      state.requests[key] = { status: 'success' };
      const result = action.payload;
      switch (result.kind) {
        case 'catalogue':
          state.catalogue = result.value;
          break;
        case 'options':
          state.options = result.value;
          break;
        case 'course':
          state.details[result.coursePublicId] = result.value;
          break;
        case 'progress':
          state.progress[result.coursePublicId] = result.value;
          break;
        case 'roster':
          state.rosters[result.coursePublicId] = result.value;
          break;
        case 'lesson':
          state.lessons[result.itemPublicId] = result.value;
          break;
      }
    });
    builder.addCase(fetchCourseResource.rejected, (state, action) => {
      const key = courseRequestKey(action.meta.arg);
      const request = state.requests[key];
      if (state.scope !== action.meta.arg.scope || request?.status !== 'pending' || request.requestId !== action.meta.requestId) {
        return;
      }
      const failure = action.payload ?? { message: 'Не удалось загрузить курс', denied: false, sourceOnly: false };
      state.requests[key] = { status: 'error', ...failure };
      if (failure.denied) {
        if (failure.sourceOnly && action.meta.arg.kind === 'lesson') {
          delete state.lessons[action.meta.arg.itemPublicId];
          return;
        }
        state.accessEpoch += 1;
        const denied = { status: 'error', ...failure } satisfies CourseRequestStatus;
        if (action.meta.arg.kind === 'catalogue') {
          state.catalogue = null;
          state.details = {};
          state.progress = {};
          state.rosters = {};
          state.lessons = {};
          state.options = null;
          for (const requestKey of Object.keys(state.requests)) {
            state.requests[requestKey] = denied;
          }
        } else if (action.meta.arg.kind === 'options') {
          state.options = null;
        } else if ('coursePublicId' in action.meta.arg) {
          const id = action.meta.arg.coursePublicId;
          delete state.details[id];
          delete state.progress[id];
          delete state.rosters[id];
          state.catalogue = state.catalogue?.filter(course => course.publicId !== id) ?? null;
          state.lessons = {};
          for (const requestKey of Object.keys(state.requests)) {
            if (['course', 'progress', 'roster'].some(kind => requestKey === `${kind}:${id}`) || requestKey.startsWith(`lesson:${id}:`)) {
              state.requests[requestKey] = denied;
            }
          }
          state.requests[`course:${id}`] = denied;
          if (state.requests.catalogue?.status === 'pending') {
            state.requests.catalogue = denied;
          }
        }
      }
    });
  },
});

export const { scopeChanged, operationChanged, courseSaved, courseRemoved, progressSaved } = coursesSlice.actions;
export default coursesSlice.reducer;
