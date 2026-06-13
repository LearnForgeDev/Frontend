import { Box, Divider } from '@mui/material';
import PendingSchoolRequestItem from './PendingSchoolRequestItem';
import { useActiveSchoolRequests } from '@/Services/AdminPanel/hooks/useActiveSchoolRequests';

export default function PendingSchoolRequestWidget() {
  const { requests, isLoading } = useActiveSchoolRequests();

  if (isLoading || requests.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: "1rem", mb: "1rem" }}
    >
      {requests.map((req) => (
        <PendingSchoolRequestItem key={req.requestPublicId} req={req} />
      ))}
      <Divider />
    </Box>
  );
}
