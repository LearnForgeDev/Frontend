import { Box, Chip, LinearProgress, Typography } from '@mui/material';
import type { CourseDetail } from '@/Services/Courses/Courses.types';
import { getCourseProgressRows } from '../../utils/courseFormatting';
import CourseState from '../CourseState/CourseState';
import { styles } from './CourseProgressPanel.styles';

interface CourseProgressPanelProps {
  course: CourseDetail;
}

export default function CourseProgressPanel({ course }: CourseProgressPanelProps) {
  const rows = getCourseProgressRows(course);
  if (!course.raw.items.length && !course.requiredItemCount) return <CourseState kind="empty" title="Прогресс появится вместе с программой" />;
  if (!rows.length) return <CourseState kind="empty" title="Пока нет данных о прогрессе" description="Прогресс появится после добавления учеников на курс." />;
  return <Box sx={styles.panel}>
    <Typography component="h2" variant="h6" sx={styles.title}>{course.canManage ? 'Прогресс учеников' : 'Мой прогресс'}</Typography>
    <Box component="ul" sx={styles.list}>
      {rows.map(row => <Box component="li" key={row.userPublicId} sx={styles.row}>
        <Typography sx={styles.name}>{row.displayName}</Typography>
        <LinearProgress variant="determinate" value={row.percentage} sx={styles.bar} aria-label={`Прогресс: ${row.displayName}`} />
        <Box sx={styles.summary}><Typography variant="body2" sx={styles.muted}>{row.label}</Typography><Typography sx={styles.percentage}>{row.percentage}%</Typography>{row.isComplete && <Chip label="Пройден" size="small" color="success" variant="outlined" />}</Box>
      </Box>)}
    </Box>
  </Box>;
}
