import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { useProvisioningRequests } from './hooks/useProvisioningRequests';
import * as S from './DeveloperRequestsPage.styles';
import { formatRequestMeta, formatRequestStatus, getAdminLoginUrl } from './DeveloperRequestsPage.utils';
import { ADMIN_LOADING_SIZE } from './DeveloperRequestsPage.const';

export default function DeveloperRequestsPage() {
  const navigate = useNavigate();
  const { requestsQuery, approveRequest, rejectRequest, isMutating, error, retryRequests } = useProvisioningRequests();

  return (
    <Box component="main" sx={S.pageSx}>
      <Box sx={S.contentSx}>
        <Box component="header" sx={S.headerSx}>
          <Box>
            <Typography component="h1" sx={S.titleSx}>Заявки на школы</Typography>
            <Typography sx={S.subtitleSx}>Служебная зона LearnForge</Typography>
          </Box>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/app')}>
            В приложение
          </Button>
        </Box>

        {error ? (
          <Alert
            severity="error"
            action={error.requiresLogin
              ? <Button color="inherit" href={getAdminLoginUrl()}>Войти</Button>
              : <Button color="inherit" disabled={requestsQuery.isFetching} onClick={retryRequests}>Повторить</Button>}
          >
            {error.message}
          </Alert>
        ) : requestsQuery.isLoading ? (
          <Box role="status" aria-label="Загрузка заявок" sx={S.loadingSx}>
            <ClipLoader color="var(--app-primary)" size={ADMIN_LOADING_SIZE} />
          </Box>
        ) : requestsQuery.data?.length ? (
          <Box sx={S.listSx}>
            {requestsQuery.data.map((request) => (
              <Box key={request.publicId} data-testid={`school-request-${request.publicId}`} sx={S.requestSx}>
                <Box>
                  <Typography component="h2" sx={S.requestTitleSx}>{request.schoolName}</Typography>
                  <Typography sx={S.metaSx}>
                    {formatRequestMeta(request)}
                  </Typography>
                </Box>
                <Chip label={formatRequestStatus(request.status)} size="small" />
                <Box sx={S.actionsSx}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseRoundedIcon />}
                    disabled={isMutating}
                    data-testid="school-request-reject" onClick={() => rejectRequest.mutate(request.publicId)}
                  >
                    Отклонить
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckRoundedIcon />}
                    disabled={isMutating}
                    data-testid="school-request-approve" onClick={() => approveRequest.mutate(request.publicId)}
                  >
                    Одобрить
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Alert severity="info">Новых заявок нет.</Alert>
        )}
      </Box>
    </Box>
  );
}
