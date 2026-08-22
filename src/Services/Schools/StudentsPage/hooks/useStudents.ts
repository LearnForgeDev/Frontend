import { useQuery } from '@tanstack/react-query';
import { studentsEndpoints } from '@/Endpoints';

export function useStudents(schoolPublicId: string, enabled = true) {
  return useQuery({
    queryKey: ['students', schoolPublicId],
    queryFn: () => studentsEndpoints.getStudents(schoolPublicId),
    enabled: enabled && Boolean(schoolPublicId),
  });
}
