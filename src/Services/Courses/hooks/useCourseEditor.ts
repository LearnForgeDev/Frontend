import { useReducer, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonsEndpoints, studentsEndpoints } from '@/Endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import type { CourseDetail, CourseInput } from '../Courses.types';
import { useToast } from '@/Storage/useToastStore';
import { getLessonOptions, getStudentOptions } from '../utils/courseOptions';
import { canEditCourseProgram, toCourseDetail } from '../utils/courseMapping';
import { validateCourse } from '../validation/courseValidation';
import { courseFormReducer, createCourseForm, getCourseInput } from './courseFormReducer';
import { COURSE_QUERY_STALE_TIME } from './useCourseQueries.const';
import { COURSE_SAVE_ERROR, EDITOR_OPTIONS_ERROR } from './useCourseEditor.const';
import { saveCourse } from './saveCourse';
import { CourseCreationUncertainError } from './saveCourse.errors';

export function useCourseEditor(schoolPublicId: string, onSaved: (course: CourseDetail) => void, course?: CourseDetail) {
  const [form, dispatch] = useReducer(courseFormReducer, course, createCourseForm);
  const draftPublicId = useRef(course?.publicId);
  const authorPublicId = useGlobalContext(state => state.auth.user?.userPublicId ?? '');
  const queryClient = useQueryClient();
  const toast = useToast();
  const options = useQuery({
    queryKey: ['course-editor-options', schoolPublicId],
    networkMode: 'always',
    queryFn: async () => {
      try {
        const [lessons, students, groups] = await Promise.all([
          lessonsEndpoints.getLessons(schoolPublicId),
          studentsEndpoints.getStudentsSimple(schoolPublicId),
          studentsEndpoints.getStudentGroups(schoolPublicId),
        ]);
        return { lessons, students, groups };
      } catch (error) { toast.error(EDITOR_OPTIONS_ERROR); throw error; }
    },
    staleTime: COURSE_QUERY_STALE_TIME, retry: false,
  });
  const lessonOptions = getLessonOptions(options.data?.lessons ?? [], course);
  const studentOptions = getStudentOptions(options.data?.students ?? [], course);
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['courses', schoolPublicId] });
    void queryClient.invalidateQueries({ queryKey: ['course-progress', schoolPublicId] });
    void queryClient.invalidateQueries({ queryKey: ['course-roster', schoolPublicId] });
  };
  const mutation = useMutation({
    networkMode: 'always',
    mutationFn: (input: CourseInput) => saveCourse({
      schoolPublicId, coursePublicId: draftPublicId.current, authorPublicId, input,
      lessons: lessonOptions, studentIds: studentOptions.map(student => student.userPublicId),
      onCreated: created => {
        draftPublicId.current = created.publicId;
        queryClient.setQueryData(['courses', schoolPublicId, created.publicId], created);
      },
    }),
    onSuccess: savedCourse => {
      queryClient.setQueryData(['courses', schoolPublicId, savedCourse.publicId], savedCourse);
      invalidate();
      toast.success(course ? 'Курс сохранён' : 'Курс создан');
    },
    onError: error => {
      invalidate();
      const message = error instanceof CourseCreationUncertainError ? error.message : COURSE_SAVE_ERROR;
      dispatch({ type: 'error', error: message });
      toast.error(message);
    },
  });
  const selectedLessons = form.lessonIds.flatMap(id => {
    const lesson = lessonOptions.find(option => option.lessonId === id);
    return lesson ? [lesson] : [];
  });
  const submit = () => {
    const input = getCourseInput(form);
    const error = validateCourse(input);
    dispatch({ type: 'error', error });
    if (error || options.isPending || options.isError || mutation.isPending || mutation.error instanceof CourseCreationUncertainError) return;
    mutation.mutate(input, { onSuccess: saved => onSaved(toCourseDetail(saved)) });
  };
  return {
    form, lessonOptions, studentOptions, selectedLessons,
    errorMessage: mutation.error instanceof CourseCreationUncertainError ? mutation.error.message : form.error,
    groupOptions: options.data?.groups ?? [],
    canEditProgram: canEditCourseProgram(course),
    isLoading: options.isPending, isError: options.isError, isSaving: mutation.isPending, isSaveBlocked: mutation.error instanceof CourseCreationUncertainError,
    submit, retry: () => void options.refetch(),
    setField: (field: 'title' | 'description', value: string) => dispatch({ type: 'field', field, value }),
    setLessons: (lessonIds: number[]) => dispatch({ type: 'lessons', lessonIds }),
    setStudents: (studentPublicIds: string[]) => dispatch({ type: 'students', studentPublicIds }),
    setGroups: (groupIds: number[]) => dispatch({ type: 'groups', groupIds }),
    setAccessMode: (accessMode: CourseInput['accessMode']) => dispatch({ type: 'access', accessMode }),
    moveLesson: (lessonId: number, direction: -1 | 1) => dispatch({ type: 'move', lessonId, direction }),
  };
}
