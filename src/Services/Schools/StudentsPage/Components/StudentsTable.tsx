import { Alert, Avatar, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { ClipLoader } from 'react-spinners';
import { useStudents } from '../hooks/useStudents';
import {
  getStudentDisplayName,
  getStudentInitials,
  getStudentPublicId,
} from './StudentsTable.utils';
import * as S from './StudentsTable.styles';

type StudentsTableProps = {
  schoolPublicId: string;
  onOpenChat: (studentPublicId: string) => void;
};

export function StudentsTable({ schoolPublicId, onOpenChat }: StudentsTableProps) {
  const studentsQuery = useStudents(schoolPublicId);

  if (studentsQuery.isLoading) {
    return (
      <Box role="status" sx={S.loadingSx}>
        <ClipLoader color="var(--app-primary)" size={30} />
      </Box>
    );
  }

  if (studentsQuery.isError) {
    return (
      <Alert
        severity="error"
        action={<Button color="inherit" onClick={() => studentsQuery.refetch()}>Повторить</Button>}
      >
        Не удалось загрузить учеников.
      </Alert>
    );
  }

  const students = studentsQuery.data ?? [];
  if (students.length === 0) {
    return <Typography sx={S.emptySx}>В школе пока нет учеников.</Typography>;
  }

  return (
    <TableContainer sx={S.cardSx}>
      <Table aria-label="Ученики школы">
        <TableHead>
          <TableRow>
            <TableCell>Ученик</TableCell>
            <TableCell>Группы</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => {
            const displayName = getStudentDisplayName(student);
            const studentPublicId = getStudentPublicId(student);

            return (
              <TableRow key={studentPublicId ?? `${displayName}-${student.email ?? ''}`} hover>
                <TableCell>
                  <Box sx={S.studentCellSx}>
                    <Avatar sx={S.avatarSx}>{getStudentInitials(displayName)}</Avatar>
                    <Box>
                      <Typography sx={S.studentNameSx}>{displayName}</Typography>
                      {student.email && (
                        <Typography variant="body2" color="text.secondary">{student.email}</Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{student.groupNames?.join(', ') || 'Без группы'}</TableCell>
                <TableCell align="right">
                  <Button
                    startIcon={<ChatBubbleOutlineRoundedIcon />}
                    disabled={!studentPublicId}
                    onClick={() => studentPublicId && onOpenChat(studentPublicId)}
                  >
                    Написать
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
