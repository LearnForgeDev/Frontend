import { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';
import JoinSchoolForm from './components/JoinSchoolForm/JoinSchoolForm';
import RequestSchoolForm from './components/RequestSchoolForm/RequestSchoolForm';
import SchoolRequestStatus from './components/SchoolRequestStatus/SchoolRequestStatus';
import DinosaurGame from './components/DinosaurGame/DinosaurGame';
import { useWaitingConfirmation } from './hooks/useWaitingConfirmation';
import * as S from './WaitingConfirmationPage.styles';

export default function WaitingConfirmationPage() {
  const { requestPublicId } = useParams<{ requestPublicId: string }>();
  const [isGameVisible, setIsGameVisible] = useState(false);
  const { statusQuery, approvedSchoolQuery, requestViewState, visibleViewState, knownSchoolPublicIds, schoolName, returnToSchools } = useWaitingConfirmation(requestPublicId);

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
              <Button onClick={returnToSchools}>К моим школам</Button>
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

        {requestViewState === 'pending' && isGameVisible && <DinosaurGame />}
      </Box>
    </Box>
  );
}
