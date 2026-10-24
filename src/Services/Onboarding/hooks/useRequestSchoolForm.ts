import { useState, type FormEvent } from 'react';
import { useRequestSchool } from './useRequestSchool';
import { validateSchoolName } from '../validation/onboarding.validation';

export function useRequestSchoolForm(initialSchoolName: string) {
  const [schoolName, setSchoolName] = useState(initialSchoolName);
  const [validationError, setValidationError] = useState<string | null>(null);
  const requestSchool = useRequestSchool();

  const changeSchoolName = (value: string) => {
    setSchoolName(value);
    setValidationError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateSchoolName(schoolName);
    setValidationError(validation.error);

    if (validation.error) {
      return;
    }

    requestSchool.mutate(validation.value);
  };

  return { schoolName, validationError, requestSchool, handleSubmit, changeSchoolName };
}
