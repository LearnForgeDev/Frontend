import { Suspense, useEffect, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';
import JoinSchoolForm from './components/JoinSchoolForm/JoinSchoolForm';
import RequestSchoolForm from './components/RequestSchoolForm/RequestSchoolForm';
import SchoolRequestStatus from './components/SchoolRequestStatus/SchoolRequestStatus';
import { useApprovedSchool } from './hooks/useApprovedSchool';
import { useOnboardingSchools } from './hooks/useOnboardingSchools';
import { useSchoolRequestStatus } from './hooks/useSchoolRequestStatus';
import { APPROVAL_REDIRECT_DELAY_MS } from './onboarding.const';
import { LazyDinosaurGame } from './WaitingConfirmationPage.const';
import {
  clearSchoolRequestPointer,
  readSchoolRequestPointer,
} from './utils/schoolRequestStorage.utils';
import { getSchoolRequestViewState } from './utils/schoolRequestStatus.utils';
import * as S from './WaitingConfirmationPage.styles';

export default function WaitingConfirmationPage() {
  const { requestPublicId } = useParams<{ requestPublicId: string }>();
  const navigate = useNavigate();
  const [isGameVisible, setIsGameVisible] = useState(false);
  const storedPointer = readSchoolRequestPointer();
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

  if (!requestPublicId) {
    return <Navigate to="/onboarding" replace />;
  }

  if (statusQuery.isLoading) {
    return (
      <Box component="main" sx={S.page}>
        <Paper sx={S.statusCard}>
          <Box sx={S.loading} role="status" aria-label="Проверяем заявку">
            <PulseLoader color="currentColor" />
          </Box>
        </Paper>
      </Box>
    );
  }

  if (statusQuery.isError) {
    return (
      <Box component="main" sx={S.page}>
        <Box sx={S.content}>
          <Paper sx={S.statusCard}>
            <Box sx={S.retry}>
              <Typography component="h1" variant="h4" sx={S.retryTitle}>
                Не удалось проверить заявку
              </Typography>
              <Typography color="text.secondary">
                Проверьте подключение и попробуйте ещё раз.
              </Typography>
              <Button variant="contained" onClick={() => statusQuery.refetch()}>
                Повторить
              </Button>
            </Box>
          </Paper>
          <Paper component="section" sx={S.actionsCard}>
            <Box sx={S.actionHeader}>
              <Typography component="h2" variant="h6" sx={S.actionTitle}>
                Есть приглашение в другую школу?
              </Typography>
            </Box>
            <JoinSchoolForm knownSchoolPublicIds={knownSchoolPublicIds} />
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="main" sx={S.page}>
      <Box sx={S.content}>
        <Paper sx={S.statusCard}>
          <SchoolRequestStatus
            schoolName={schoolName}
            viewState={visibleViewState}
          />
          {approvedSchoolQuery.isError && (
            <Box sx={S.provisioningRetry}>
              <Button onClick={() => approvedSchoolQuery.refetch()}>
                Повторить проверку школы
              </Button>
            </Box>
          )}
        </Paper>

        {requestViewState === 'rejected' && (
          <Paper component="section" sx={S.actionsCard}>
            <Box sx={S.actionHeader}>
              <Typography component="h2" variant="h6" sx={S.actionTitle}>
                Отправить новую заявку
              </Typography>
            </Box>
            <RequestSchoolForm initialSchoolName={schoolName} />
          </Paper>
        )}

        {requestViewState !== 'approved' && (
          <Paper component="section" sx={S.actionsCard}>
            <Box sx={S.actionHeader}>
              <Typography component="h2" variant="h6" sx={S.actionTitle}>
                Присоединиться к другой школе
              </Typography>
              <Typography color="text.secondary">
                Текущая заявка останется активной.
              </Typography>
            </Box>
            <JoinSchoolForm knownSchoolPublicIds={knownSchoolPublicIds} />
          </Paper>
        )}

        {requestViewState === 'pending' && !isGameVisible && (
          <Button
            variant="text"
            onClick={() => setIsGameVisible(true)}
            sx={S.gameButton}
          >
            Скоротать время
          </Button>
        )}

        {isGameVisible && (
          <Suspense fallback={<PulseLoader color="currentColor" />}>
            <LazyDinosaurGame />
          </Suspense>
        )}
      </Box>
    </Box>
  );
}
