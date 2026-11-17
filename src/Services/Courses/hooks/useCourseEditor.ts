import { isAxiosError } from 'axios';
import { useEffect, useReducer, useRef, useState } from 'react';
import type { CourseBlock, CourseDetail } from '../Courses.type';
import { useToast } from '@/Storage/useToastStore';
import { getStudentOptions } from '../utils/courseOptions';
import { validateCourse } from '../validation/courseValidation';
import { courseFormReducer, createCourseForm, getCourseInput } from './courseFormReducer';
import { COURSE_SAVE_ERROR } from './useCourseEditor.const';
import { CourseCreationUncertainError } from './saveCourse.errors';
import { useCourses } from './useCourses';

export function useCourseEditor(schoolPublicId: string, onSaved: (course: CourseDetail) => void, course?: CourseDetail) {
  const [form, dispatch] = useReducer(courseFormReducer, course, createCourseForm);
  const draftPublicId = useRef(course?.publicId);
  const [needsCompletionChoice, setNeedsCompletionChoice] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const isSaveBlocked = blockedMessage !== null;
  const feature = useCourses(schoolPublicId);
  const { read } = feature;
  const toast = useToast();
  useEffect(() => {
    void read({ kind: 'options', refresh: true });
  }, [read]);
  const optionsRequest = feature.state.requests.options;
  const studentOptions = getStudentOptions(feature.state.options?.students ?? [], course);
  const isSaving = feature.state.operations.save ?? false;
  const isLoading = !feature.state.options && optionsRequest?.status !== 'error';
  const isError = optionsRequest?.status === 'error';
  const submit = async (keepCompletion?: boolean) => {
    const input = getCourseInput(form);
    const error = validateCourse(input);
    dispatch({ type: 'error', error });
    if (error || isLoading || isError || isSaving || isSaveBlocked) {
      return;
    }
    const programChanged = course && form.blocks.some(block => {
      if (block.kind !== 'supported' || !block.publicId) {
        return false;
      }
      const original = course.items.find(item => item.publicId === block.publicId)?.block;
      return original?.kind === 'supported' && JSON.stringify(original.input) !== JSON.stringify(block.input);
    });
    if (programChanged && keepCompletion === undefined) {
      setNeedsCompletionChoice(true);
      return;
    }
    setNeedsCompletionChoice(false);
    try {
      const saved = await feature.save({ ...input, keepCompletion: keepCompletion ?? true }, draftPublicId.current, publicId => {
        draftPublicId.current = publicId;
      }, (clientId, publicId) => dispatch({ type: 'created', clientId, publicId }));
      toast.success(course ? 'Курс сохранён' : 'Курс создан');
      onSaved(saved);
    } catch (failure) {
      if (failure instanceof CourseCreationUncertainError) {
        setBlockedMessage(failure.message);
      }
      const message = failure instanceof Error && !isAxiosError(failure) ? failure.message : COURSE_SAVE_ERROR;
      dispatch({ type: 'error', error: message });
      toast.error(message);
    }
  };
  return {
    form, resources: feature.resources, studentOptions,
    errorMessage: blockedMessage ?? form.error, groupOptions: feature.state.options?.groups ?? [],
    isLoading, isError, isSaving, isSaveBlocked,
    homeworkError: feature.homework.status === 'error',
    submit, needsCompletionChoice, cancelCompletionChoice: () => setNeedsCompletionChoice(false), retry: () => {
      void read({ kind: 'options', refresh: true });
      void feature.homework.refresh();
    },
    setField: (field: 'title' | 'description', value: string) => dispatch({ type: 'field', field, value }),
    setBlocks: (blocks: CourseBlock[]) => dispatch({ type: 'blocks', blocks }),
    setStudents: (studentPublicIds: string[]) => dispatch({ type: 'students', studentPublicIds }),
    setGroups: (groupIds: number[]) => dispatch({ type: 'groups', groupIds }),
    setAccessMode: (accessMode: 'selected' | 'school') => dispatch({ type: 'access', accessMode }),
  };
}
