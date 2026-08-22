import { Alert, Box, Button } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { Navigate } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useMySchools } from '@/Services/Schools/hooks/useMySchools';

export default function AppEntryPage() {
  const activeSchoolPublicId = useGlobalContext((state) => state.auth.user?.activeSchoolPublicId);
  const schoolsQuery = useMySchools();

  if (schoolsQuery.isLoading) {
    return (
      <Box role="status" sx={{ minHeight: 360, display: 'grid', placeItems: 'center' }}>
        <ClipLoader color="var(--app-primary)" size={32} />
      </Box>
    );
  }

  if (schoolsQuery.isError) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', py: 8 }}>
        <Alert
          severity="error"
          action={<Button color="inherit" onClick={() => schoolsQuery.refetch()}>Повторить</Button>}
        >
          Не удалось загрузить список школ.
        </Alert>
      </Box>
    );
  }

  const schools = schoolsQuery.data ?? [];
  const activeSchool = schools.find((item) => item.schoolPublicId === activeSchoolPublicId) ?? schools[0];

  if (!activeSchool) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to={`/app/schools/${activeSchool.schoolPublicId}/today`} replace />;
}
