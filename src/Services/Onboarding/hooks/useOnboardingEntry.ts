import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { readSchoolRequestPointer } from '../utils/schoolRequestStorage.utils';
import { useOnboardingSchools } from './useOnboardingSchools';

export function useOnboardingEntry() {
  const userPublicId = useGlobalContext((state) => state.auth.user?.userPublicId);
  const schoolsQuery = useOnboardingSchools();

  return {
    pointer: readSchoolRequestPointer(userPublicId),
    knownSchoolPublicIds: schoolsQuery.data?.map((school) => school.schoolPublicId) ?? [],
  };
}
