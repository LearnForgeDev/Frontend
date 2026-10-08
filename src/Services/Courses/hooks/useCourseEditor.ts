import { useReducer } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonsEndpoints } from '@/Endpoints';
import { coursesEndpoints, type CourseDetail, type CourseInput } from '@/Endpoints/courses';
import { useToast } from '@/Storage/useToastStore';
import { getLessonOptions, getStudentOptions } from '../utils/courseOptions';
import { validateCourse } from '../validation/courseValidation';
import { courseFormReducer, createCourseForm, getCourseInput } from './courseFormReducer';
import { COURSE_QUERY_STALE_TIME } from './useCourseQueries.const';
import { COURSE_SAVE_ERROR, EDITOR_OPTIONS_ERROR } from './useCourseEditor.const';

export function useCourseEditor(schoolPublicId: string, onSaved: (course: CourseDetail) => void, course?: CourseDetail) {
  const [form, dispatch] = useReducer(courseFormReducer, course, createCourseForm);
  const queryClient = useQueryClient();
  const toast = useToast();
  const lessons = useQuery({
    queryKey: ['lessons', schoolPublicId],
    queryFn: async () => {
      try {
        return await lessonsEndpoints.getLessons(schoolPublicId);
      } catch (error) {
        toast.error(EDITOR_OPTIONS_ERROR);
        throw error;
      }
    },
    staleTime: COURSE_QUERY_STALE_TIME,
    retry: false,
  });
  const students = useQuery({
    queryKey: ['course-students', schoolPublicId],
    queryFn: async () => {
      try {
        return await coursesEndpoints.getStudents(schoolPublicId);
      } catch (error) {
        toast.error(EDITOR_OPTIONS_ERROR);
        throw error;
      }
    },
    staleTime: COURSE_QUERY_STALE_TIME,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: (input: CourseInput) => course
      ? coursesEndpoints.updateCourse(schoolPublicId, course.publicId, input)
      : coursesEndpoints.createCourse(schoolPublicId, input),
    onSuccess: savedCourse => {
      queryClient.setQueryData(['courses', schoolPublicId, savedCourse.publicId], savedCourse);
      void queryClient.invalidateQueries({ queryKey: ['courses', schoolPublicId] });
      toast.success(course ? 'Курс сохранён' : 'Курс создан');
    },
    onError: () => {
      dispatch({ type: 'error', error: COURSE_SAVE_ERROR });
      toast.error(COURSE_SAVE_ERROR);
    },
  });
  const lessonOptions = getLessonOptions(lessons.data ?? [], course);
  const studentOptions = getStudentOptions(students.data ?? [], course);
  const isLoading = lessons.isPending || students.isPending;
  const isError = lessons.isError || students.isError;
  const selectedLessons = form.lessonIds.flatMap(id => {
    const lesson = lessonOptions.find(option => option.lessonId === id);
    return lesson ? [lesson] : [];
  });

  const submit = () => {
    const input = getCourseInput(form);
    const error = validateCourse(input);
    dispatch({ type: 'error', error });
    if (error || isLoading || isError || mutation.isPending) return;
    mutation.mutate(input, { onSuccess: onSaved });
  };

  return {
    form,
    lessonOptions,
    studentOptions,
    selectedLessons,
    isLoading,
    isError,
    isSaving: mutation.isPending,
    submit,
    retry: () => {
      void lessons.refetch();
      void students.refetch();
    },
    setField: (field: 'title' | 'description', value: string) => dispatch({ type: 'field', field, value }),
    setLessons: (lessonIds: number[]) => dispatch({ type: 'lessons', lessonIds }),
    setStudents: (studentPublicIds: string[]) => dispatch({ type: 'students', studentPublicIds }),
    moveLesson: (lessonId: number, direction: -1 | 1) => dispatch({ type: 'move', lessonId, direction }),
  };
}
