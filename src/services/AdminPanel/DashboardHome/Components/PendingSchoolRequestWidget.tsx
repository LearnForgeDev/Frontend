import { Box, Typography, CircularProgress, Divider } from '@mui/material';
import ClockIcon from '@/Assets/Art/images/ClockIcon.tsx';
import * as S from './PendingSchoolRequestWidget.styles';
import { useActiveSchoolRequests } from '@/Services/AdminPanel/hooks/useActiveSchoolRequests';

export default function PendingSchoolRequestWidget() {
  const { requests, isLoading } = useActiveSchoolRequests();

  if (isLoading || requests.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
      case "Created":
      case "Completed":
        return (
          <Box
            component="span"
            className="material-symbols-outlined"
            sx={{ color: "success.main", fontSize: "20px" }}
          >
            check_circle
          </Box>
        );
      case "Rejected":
      case "Failed":
        return (
          <Box
            component="span"
            className="material-symbols-outlined"
            sx={{ color: "error.main", fontSize: "20px" }}
          >
            cancel
          </Box>
        );
      default:
        return <CircularProgress size={16} color="warning" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Approved":
        return "Одобрено";
      case "Rejected":
        return "Отклонено";
      case "Pending":
        return "На рассмотрении";
      case "Created":
      case "Completed":
        return "Создано";
      case "Processing":
        return "В обработке";
      case "Accepted":
        return "Принято";
      case "Failed":
        return "Ошибка";
      default:
        return status;
    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: "1rem", mb: "1rem" }}
    >
      {requests.map((req) => (
        <Box key={req.requestPublicId} sx={S.container(req.status)}>
          <Typography component="h2" sx={S.title(req.status)}>
            <ClockIcon style={S.icon(req.status)} />
            Заявка на школу
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {getStatusIcon(req.status)}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {req.schoolName || "Без названия"}
              </Typography>
              <Typography sx={S.description}>
                Статус: {getStatusText(req.status)}
              </Typography>
              {req.requestedAt && (
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "var(--admin-muted)", fontSize: "0.7rem" }}
                >
                  {new Date(req.requestedAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      ))}
      <Divider />
    </Box>
  );
}
