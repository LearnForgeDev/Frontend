import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApprovedSchool } from './useApprovedSchool';
import { useOnboardingSchools } from './useOnboardingSchools';
import { useSchoolRequestStatus } from './useSchoolRequestStatus';
import { APPROVAL_REDIRECT_DELAY_MS } from '../onboarding.const';
import { clearSchoolRequestPointer, readSchoolRequestPointer } from '../utils/schoolRequestStorage.utils';
import { getSchoolRequestViewState } from '../utils/schoolRequestStatus.utils';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

export function useWaitingConfirmation(requestPublicId?: string) {
  const navigate = useNavigate();
  const userPublicId = useGlobalContext((state) => state.auth.user?.userPublicId);
  const storedPointer = readSchoolRequestPointer(userPublicId);
  const pointer =
    storedPointer?.requestPublicId === requestPublicId ? storedPointer : null;
  const statusQuery = useSchoolRequestStatus(requestPublicId);
  const schoolsQuery = useOnboardingSchools();
  const requestViewState = getSchoolRequestViewState(statusQuery.data?.status);
  const knownSchoolPublicIds =
    schoolsQuery.data?.map((school) => school.schoolPublicId) ?? [];
  const schoolName =
    statusQuery.data?.schoolName ?? pointer?.schoolName ?? 'Новая школа';
  const effectivePointer =
    pointer ??
    (requestPublicId
      ? { requestPublicId, schoolName, knownSchoolPublicIds }
      : null);
  const approvedSchoolQuery = useApprovedSchool(
    effectivePointer,
    statusQuery.data,
    requestViewState === 'approved',
  );
  const approvedSchool = approvedSchoolQuery.data;
  const visibleViewState =
    requestViewState === 'approved' && !approvedSchool
      ? 'provisioning'
      : requestViewState;

  useEffect(() => {
    if (!requestPublicId || !approvedSchool) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      clearSchoolRequestPointer(requestPublicId);
      navigate(`/app/schools/${approvedSchool.schoolPublicId}/today`, {
        replace: true,
      });
    }, APPROVAL_REDIRECT_DELAY_MS);

    return () => window.clearTimeout(redirectTimer);
  }, [approvedSchool, navigate, requestPublicId]);

  const returnToSchools = () => {
    clearSchoolRequestPointer(requestPublicId);
    navigate('/app', { replace: true });
  };

  return { statusQuery, approvedSchoolQuery, requestViewState, visibleViewState, knownSchoolPublicIds, schoolName, returnToSchools };
}
