import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { schoolsEndpoints } from '@/Endpoints/schools/schools.endpoints';
import type { SchoolRequestPointer } from '../types/onboarding.types';
import { saveSchoolRequestPointer } from '../utils/schoolRequestStorage.utils';

export function useRequestSchool() {
  const navigate = useNavigate();

  return useMutation<SchoolRequestPointer, Error, string>({
    mutationFn: async (schoolName) => {
      const schoolsBeforeRequest = await schoolsEndpoints.getMySchools();
      const request = await authEndpoints.requestSchool({ schoolName });

      if (!request.requestPublicId) {
        throw new Error('School request public id is missing');
      }

      const pointer: SchoolRequestPointer = {
        requestPublicId: request.requestPublicId,
        schoolName,
        knownSchoolPublicIds: schoolsBeforeRequest.map(
          (school) => school.schoolPublicId,
        ),
      };

      saveSchoolRequestPointer(pointer);
      return pointer;
    },
    onSuccess: (pointer) => {
      navigate(`/onboarding/waiting/${pointer.requestPublicId}`);
    },
  });
}
