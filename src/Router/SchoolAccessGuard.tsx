import { lazy, Suspense } from 'react';
import { Alert, Box, Button } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { Navigate, Outlet, useMatch, useParams } from 'react-router-dom';
import { useMySchools } from '@/Services/Schools/hooks/useMySchools';
import { getSchoolCapabilities } from '@/Services/AppShell/utils/getSchoolCapabilities';
import { ChatProvider } from '@/Services/Chat/components/ChatProvider/ChatProvider';

const ChatWidget = lazy(() => import('@/Services/Chat/components/ChatWidget/ChatWidget'));

export default function SchoolAccessGuard() {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const isChatsPage = useMatch('/app/schools/:schoolPublicId/chats');
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
        action={<Button color="inherit" onClick={() => void schoolsQuery.refetch()}>Повторить</Button>}
      >
        Не удалось проверить доступ к школе.
      </Alert>
    );
  }

  const school = schoolsQuery.data?.find((item) => item.schoolPublicId === schoolPublicId);
  if (!school || !getSchoolCapabilities(school.roles).canAccessSchool) {
    return <Navigate to="/app/schools" replace />;
  }

  return <>
    <Outlet />
    {!isChatsPage && (
      <Suspense fallback={null}>
        <ChatProvider key={school.schoolPublicId}>
          <ChatWidget schoolPublicId={school.schoolPublicId} />
        </ChatProvider>
      </Suspense>
    )}
  </>;
}
