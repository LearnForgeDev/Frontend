import { useQuery } from '@tanstack/react-query';
import { studentsEndpoints, type AppError, type SimpleStudentDto } from '@/Endpoints';
import { useSchoolId } from '@/Services/Scheduling/hooks/useSchoolId/useSchoolId';
import type { UseSchoolStudentsReturn } from './useSchoolStudents.types';

export function useSchoolStudents(): UseSchoolStudentsReturn {
  const schoolId = useSchoolId();

  const { data, isLoading, isError, error, refetch } = useQuery<SimpleStudentDto[], AppError>({
    queryKey: ['school-students', schoolId],
    queryFn: () => studentsEndpoints.getStudentsSimple(schoolId),
    enabled: Boolean(schoolId),
    staleTime: 0,
  });

  const students = data ?? [];

  return {
    students,
    studentIds: students
      .map((student) => student.publicId || student.userPublicId)
      .filter((studentPublicId): studentPublicId is string => Boolean(studentPublicId)),
    isLoading,
    isError,
    error: error ?? null,
    refetch: () => {
      void refetch();
    },
  };
}
