import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { useOnboardingSchools } from '../../hooks/useOnboardingSchools';
import JoinSchoolForm from '../JoinSchoolForm/JoinSchoolForm';
import RequestSchoolForm from '../RequestSchoolForm/RequestSchoolForm';
import * as S from './SchoolSetup.styles';

type SchoolSetupProps = { inviteToken: string };

export default function SchoolSetup({ inviteToken }: SchoolSetupProps) {
  const schoolsQuery = useOnboardingSchools();

  return (
    <Box sx={S.scenarios}>
      <Paper component="section" elevation={0} sx={S.card} aria-labelledby="school-join-title">
        <Box sx={S.cardHeader}>
          <Typography component="h2" variant="h6" id="school-join-title" sx={S.title}>
            Вступить в школу
          </Typography>
        </Box>
        {schoolsQuery.isError && (
          <Alert severity="error" sx={S.error}>
            Не удалось загрузить школы.
            <Button onClick={() => void schoolsQuery.refetch()}>Повторить</Button>
          </Alert>
        )}
        <JoinSchoolForm
          knownSchoolPublicIds={schoolsQuery.knownSchoolPublicIds}
          initialInviteToken={inviteToken}
          allowInviteLink
          disabled={!schoolsQuery.isSuccess}
        />
      </Paper>
      <Paper component="section" elevation={0} sx={S.card} aria-labelledby="school-create-title">
        <Box sx={S.cardHeader}>
          <Typography component="h2" variant="h6" id="school-create-title" sx={S.title}>
            Создать школу
          </Typography>
        </Box>
        <RequestSchoolForm />
      </Paper>
    </Box>
  );
}
