import { Alert, Box, Button } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useMySchools } from '@/Services/Schools/hooks/useMySchools';
import { getSchoolCapabilities } from '@/Services/AppShell/utils/getSchoolCapabilities';

export default function SchoolAccessGuard() {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const schoolsQuery = useMySchools();

  if (schoolsQuery.isLoading) {
    return (
      <Box role="status" sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
        <ClipLoader color="var(--app-primary)" size={32} />
      </Box>
    );
  }

  if (schoolsQuery.isError) {
    return (
      <Alert
        severity="error"
        action={<Button color="inherit" onClick={() => schoolsQuery.refetch()}>Повторить</Button>}
      >
        Не удалось проверить доступ к школе.
      </Alert>
    );
  }

  const school = schoolsQuery.data?.find((item) => item.schoolPublicId === schoolPublicId);
  if (!school || !getSchoolCapabilities(school.roles).canAccessSchool) {
    return <Navigate to="/app/schools" replace />;
  }

  return <Outlet />;
}
