import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useOnboardingSchools } from './useOnboardingSchools';
import { readSchoolRequestPointer } from '../utils/schoolRequestStorage.utils';

export function useOnboarding() {
  const userPublicId = useGlobalContext((state) => state.auth.user?.userPublicId);
  const schoolsQuery = useOnboardingSchools();
  return {
    pointer: readSchoolRequestPointer(userPublicId),
    knownSchoolPublicIds: schoolsQuery.data?.map((school) => school.schoolPublicId) ?? [],
  };
}
