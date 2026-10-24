import { useRef, useState } from 'react';
import type { CourseFormState } from '../Courses.types';
import { hasCourseChanges } from './useCourseDismissal.utils';

export function useCourseDismissal(form: CourseFormState, isSaving: boolean, onClose: () => void) {
  const initial = useRef(form);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const requestClose = () => {
    if (isSaving) return;
    if (hasCourseChanges(form, initial.current)) {
      setNeedsConfirmation(true);
      return;
    }
    onClose();
  };

  const discard = () => {
    if (!isSaving) onClose();
  };

  return {
    needsConfirmation, requestClose, discard,
    keepEditing: () => setNeedsConfirmation(false),
  };
}
