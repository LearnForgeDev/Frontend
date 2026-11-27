import { Box, Paper, Typography } from '@mui/material';
import JoinSchoolForm from '../JoinSchoolForm/JoinSchoolForm';
import RequestSchoolForm from '../RequestSchoolForm/RequestSchoolForm';
import * as S from './SchoolSetup.styles';

export default function SchoolSetup() {
  return (
    <Box sx={S.scenarios}>
      <Paper component="section" elevation={0} sx={S.card} aria-labelledby="school-join-title">
        <Box sx={S.cardHeader}>
          <Typography component="h2" variant="h6" id="school-join-title" sx={S.title}>
            Вступить в школу
          </Typography>
        </Box>
        <JoinSchoolForm allowInviteLink />
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
