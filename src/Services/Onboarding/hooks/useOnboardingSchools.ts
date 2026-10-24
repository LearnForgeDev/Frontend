import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints/schools/schools.endpoints';

export function useOnboardingSchools() {
  const query = useQuery({
    queryKey: ['my-schools'],
    queryFn: () => schoolsEndpoints.getMySchools(),
  });
  return { ...query, knownSchoolPublicIds: query.data?.map((school) => school.schoolPublicId) ?? [] };
}
