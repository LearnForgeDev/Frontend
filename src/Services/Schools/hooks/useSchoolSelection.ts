import { useNavigate, useParams } from 'react-router-dom';
import type { UserSchoolInfo } from '@/Endpoints/schools/schools.contract.type';
import { getSchoolCapabilities } from '@/Services/AppShell/utils/getSchoolCapabilities';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { resolveSchoolSelection } from '../schools.selection';
import { useMySchools } from './useMySchools';

export function useSchoolSelection() {
  const { schoolPublicId: routeSchoolPublicId } = useParams<{ schoolPublicId: string }>();
  const activeSchoolPublicId = useGlobalContext(state => state.auth.user?.activeSchoolPublicId);
  const setActiveSchoolPublicId = useGlobalContext(state => state.auth.setActiveSchoolPublicId);
  const schoolsQuery = useMySchools();
  const navigate = useNavigate();
  const school = resolveSchoolSelection({ schools: schoolsQuery.data ?? [], routeSchoolPublicId, activeSchoolPublicId });

  const rememberCurrentSchool = () => {
    if (school) {
      setActiveSchoolPublicId(school.schoolPublicId);
    }
  };

  const selectSchool = (selectedSchool: UserSchoolInfo) => {
    const confirmedSchool = schoolsQuery.data?.find(item => item.schoolPublicId === selectedSchool.schoolPublicId);
    if (!confirmedSchool || !getSchoolCapabilities(confirmedSchool.roles).canAccessSchool) {
      return;
    }
    setActiveSchoolPublicId(confirmedSchool.schoolPublicId);
    const path = `/app/schools/${encodeURIComponent(confirmedSchool.schoolPublicId)}/today`;
    if (confirmedSchool.schoolPublicId !== school?.schoolPublicId) {
      window.location.assign(path);
      return;
    }
    navigate(path);
  };

  return { school, schoolPublicId: school?.schoolPublicId, schoolsQuery, rememberCurrentSchool, selectSchool };
}
