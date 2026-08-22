import { Alert, Box, Button, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useNavigate } from 'react-router-dom';
import type { UserSchoolInfo } from '@/Endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import ActiveSchoolsList from './Components/ActiveSchoolsList';
import { useSchools } from './hooks/useSchools';
import * as S from './SchoolsPage.styles';

export default function SchoolsPage() {
  const navigate = useNavigate();
  const activeSchoolPublicId = useGlobalContext((state) => state.auth.user?.activeSchoolPublicId);
  const setActiveSchoolPublicId = useGlobalContext((state) => state.auth.setActiveSchoolPublicId);
  const schoolsQuery = useSchools();

  const handleNavigateToSchool = (school: UserSchoolInfo) => {
    setActiveSchoolPublicId(school.schoolPublicId);
    navigate(`/app/schools/${school.schoolPublicId}/today`);
  };

  return (
    <Box sx={S.pageSx}>
      <Box sx={S.headerSx}>
        <Box>
          <Typography component="h1" sx={S.titleSx}>Мои школы</Typography>
          <Typography sx={S.descriptionSx}>
            Выберите рабочее пространство или присоединитесь к новой школе.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/onboarding')}>
          Добавить школу
        </Button>
      </Box>

      {schoolsQuery.isError && (
        <Alert
          severity="error"
          action={<Button color="inherit" onClick={() => schoolsQuery.refetch()}>Повторить</Button>}
        >
          Не удалось загрузить список школ.
        </Alert>
      )}

      <ActiveSchoolsList
        schools={schoolsQuery.data ?? []}
        isLoading={schoolsQuery.isLoading}
        activeSchoolPublicId={activeSchoolPublicId}
        onNavigateToSchool={handleNavigateToSchool}
      />
    </Box>
  );
}
