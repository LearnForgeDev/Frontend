import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints/schools/schools.endpoints';

export function useOnboardingSchools() {
  return useQuery({
    queryKey: ['my-schools'],
    queryFn: () => schoolsEndpoints.getMySchools(),
  });
}
