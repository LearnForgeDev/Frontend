import { useParams } from 'react-router-dom';
import { useMySchools } from '@/Services/Schools/hooks/useMySchools';
import { getSchoolCapabilities } from '../utils/getSchoolCapabilities';

export function useCurrentSchool() {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const schoolsQuery = useMySchools();
  const school = schoolsQuery.data?.find((item) => item.schoolPublicId === schoolPublicId);
  const capabilities = getSchoolCapabilities(school?.roles ?? []);

  return {
    schoolPublicId,
    school,
    capabilities,
    schoolsQuery,
  };
}
