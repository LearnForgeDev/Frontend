import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints';

export const useMySchools = () => {
  return useQuery({
    queryKey: ['my-schools'],
    queryFn: () => schoolsEndpoints.getMySchools(),
  });
};
