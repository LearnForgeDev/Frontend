import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { schoolsEndpoints } from '@/Endpoints/schools/schools.endpoints';

interface StudentsTableProps {
  schoolPublicId: string;
}

interface StudentData {
  userPublicId?: string;
  id?: string;
  displayName?: string;
  name?: string;
  firstName?: string;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({ schoolPublicId }) => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await schoolsEndpoints.getStudents(schoolPublicId);
        if (isMounted) {
          setStudents(data as StudentData[]);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Ошибка при загрузке списка студентов');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchStudents();
    return () => {
      isMounted = false;
    };
  }, [schoolPublicId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (students.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Typography color="text.secondary">Студентов пока нет</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} className="admin-card" sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Имя</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.userPublicId || student.id || index}>
              <TableCell>{student.displayName || student.name || student.firstName || 'Неизвестно'}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                {student.userPublicId || student.id || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
