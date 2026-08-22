import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { useProvisioningRequests } from './hooks/useProvisioningRequests';
import * as S from './DeveloperRequestsPage.styles';

export default function DeveloperRequestsPage() {
  const navigate = useNavigate();
  const { requestsQuery, approveRequest, rejectRequest } = useProvisioningRequests();
  const isMutating = approveRequest.isPending || rejectRequest.isPending;

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

        {requestsQuery.isError ? (
          <Alert
            severity="error"
            action={<Button color="inherit" onClick={() => requestsQuery.refetch()}>Повторить</Button>}
          >
            Нет доступа или не удалось загрузить заявки.
          </Alert>
        ) : requestsQuery.isLoading ? (
          <Box role="status" sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
            <ClipLoader color="var(--app-primary)" size={32} />
          </Box>
        ) : requestsQuery.data?.length ? (
          <Box sx={S.listSx}>
            {requestsQuery.data.map((request) => (
              <Box key={request.publicId} sx={S.requestSx}>
                <Box>
                  <Typography component="h2" sx={{ fontWeight: 800 }}>{request.schoolName}</Typography>
                  <Typography sx={S.metaSx}>
                    {request.requesterName ? `Автор: ${request.requesterName} · ` : ''}
                    {request.requestedAt ? new Date(request.requestedAt).toLocaleString('ru-RU') : request.publicId}
                  </Typography>
                </Box>
                <Chip label={request.status} size="small" />
                <Box sx={S.actionsSx}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseRoundedIcon />}
                    disabled={isMutating}
                    onClick={() => rejectRequest.mutate(request.publicId)}
                  >
                    Отклонить
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckRoundedIcon />}
                    disabled={isMutating}
                    onClick={() => approveRequest.mutate(request.publicId)}
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
