import { Box, Button, Skeleton, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import type { UserSchoolInfo } from '@/Endpoints';
import { formatRoles } from '@/Assets/globalUtils';
import * as S from './ActiveSchoolsList.styles';

type ActiveSchoolsListProps = {
  schools: UserSchoolInfo[];
  isLoading: boolean;
  activeSchoolPublicId?: string;
  onNavigateToSchool: (school: UserSchoolInfo) => void;
};

export default function ActiveSchoolsList({
  schools,
  isLoading,
  activeSchoolPublicId,
  onNavigateToSchool,
}: ActiveSchoolsListProps) {
  if (isLoading) {
    return (
      <Box sx={S.gridSx} aria-label="Загрузка школ">
        {[0, 1, 2].map((item) => <Skeleton key={item} variant="rounded" height={190} sx={S.skeletonSx} />)}
      </Box>
    );
  }

  if (schools.length === 0) {
    return (
      <Box sx={S.emptySx}>
        <Box sx={S.emptyIconSx}><SchoolRoundedIcon /></Box>
        <Typography component="h2" sx={S.emptyTitleSx}>Пока нет школ</Typography>
        <Typography sx={S.emptyTextSx}>
          Присоединитесь по приглашению или отправьте заявку на создание школы.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={S.gridSx}>
      {schools.map((school) => {
        const isActive = school.schoolPublicId === activeSchoolPublicId;
        return (
          <Box key={school.schoolPublicId} sx={S.cardSx(isActive)}>
            <Box sx={S.cardIconSx}><SchoolRoundedIcon /></Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h2" sx={S.cardTitleSx} noWrap>{school.schoolName}</Typography>
              <Typography sx={S.cardRoleSx}>{formatRoles(school.roles)}</Typography>
            </Box>
            <Button
              onClick={() => onNavigateToSchool(school)}
              endIcon={<ArrowForwardRoundedIcon />}
              variant={isActive ? 'contained' : 'outlined'}
              fullWidth
              sx={S.openButtonSx}
            >
              {isActive ? 'Продолжить работу' : 'Открыть школу'}
            </Button>
          </Box>
        );
      })}
    </Box>
  );
}
