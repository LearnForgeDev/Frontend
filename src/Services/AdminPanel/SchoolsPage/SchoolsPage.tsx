import { Alert, Box, Button, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useNavigate } from 'react-router-dom';
import { useSchoolSelection } from '@/Services/Schools/hooks/useSchoolSelection';
import ActiveSchoolsList from './Components/ActiveSchoolsList';
import * as S from './SchoolsPage.styles';

export default function SchoolsPage() {
  const navigate = useNavigate();
  const { school, schoolsQuery, selectSchool } = useSchoolSelection();

  return (
    <Box sx={S.pageSx}>
      <Box sx={S.headerSx}>
        <Box>
          <Typography component="h1" sx={S.titleSx}>Мои школы</Typography>
          <Typography sx={S.descriptionSx}>
            Выберите рабочее пространство или присоединитесь к новой школе.
          </Typography>
        </Box>
        <Button data-testid="school-add" variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/onboarding')}>
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
        activeSchoolPublicId={school?.schoolPublicId}
        onNavigateToSchool={selectSchool}
      />
    </Box>
  );
}
