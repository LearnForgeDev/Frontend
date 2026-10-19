import { Box, Button, Chip, Typography } from '@mui/material';
import { PersonOutlined } from '@mui/icons-material';
import type { CourseStudent } from '../../Courses.types';
import CourseState from '../CourseState/CourseState';
import { formatStudentCount } from '../../utils/courseFormatting';
import { styles } from './CourseStudentsPanel.styles';

interface CourseStudentsPanelProps {
  students: CourseStudent[];
  onEdit: () => void;
}

export default function CourseStudentsPanel({ students, onEdit }: CourseStudentsPanelProps) {
  if (!students.length) return <CourseState kind="empty" title="Добавьте первых учеников" description="Выберите учеников школы, которым будет доступен курс." actionLabel="Добавить учеников" onAction={onEdit} />;
  return <Box sx={styles.panel}>
    <Box sx={styles.header}>
      <Typography component="h2" variant="h6" sx={styles.title}>{formatStudentCount(students.length)}</Typography>
      <Button onClick={onEdit} sx={styles.button}>Изменить состав</Button>
    </Box>
    <Box component="ul" sx={styles.list}>
      {students.map(student => <Box component="li" key={student.userPublicId} sx={styles.row}>
        <Box sx={styles.identity}><PersonOutlined sx={styles.icon} /><Typography sx={styles.name}>{student.displayName}</Typography></Box>
        <Chip label={student.accessLabel} size="small" variant="outlined" />
      </Box>)}
    </Box>
  </Box>;
}
