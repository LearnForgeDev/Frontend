import { Box, Typography } from '@mui/material';
import ClockIcon from '@/Assets/Art/images/ClockIcon.tsx';
import StatusIcon from '@/Assets/Components/StatusIcon/StatusIcon';
import * as S from './PendingSchoolRequestWidget.styles';
import type { SchoolRequestStatusDto } from '@/Endpoints/apiAuth';

type Props = {
  req: SchoolRequestStatusDto;
};

const getStatusText = (status: string) => {
  const STATUS_MAP: Record<string, string> = {
    "Approved": "Одобрено",
    "Rejected": "Отклонено",
    "Pending": "На рассмотрении",
    "Created": "Создано",
    "Completed": "Создано",
    "Processing": "В обработке",
    "Accepted": "Принято",
    "Failed": "Ошибка",
  };
  return STATUS_MAP[status] || status;
};

export default function PendingSchoolRequestItem({ req }: Props) {
  return (
    <Box sx={S.container(req.status)}>
      <Typography component="h2" sx={S.title(req.status)}>
        <ClockIcon style={S.icon(req.status)} />
        Заявка на школу
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <StatusIcon status={req.status} />
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
  );
}
