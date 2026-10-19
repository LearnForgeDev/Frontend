import { Box, Card, CardActionArea, LinearProgress, Typography } from '@mui/material';
import { AutoStoriesOutlined, GroupOutlined, SchoolOutlined } from '@mui/icons-material';
import type { CourseSummary } from '@/Services/Courses/Courses.types';
import { formatLessonCount, formatStudentCount, getCourseProgressLabel } from '../../utils/courseFormatting';
import { styles } from './CourseCard.styles';

interface CourseCardProps {
  course: CourseSummary;
  onOpen: () => void;
}

export default function CourseCard({ course, onOpen }: CourseCardProps) {
  return (
    <Card variant="outlined" sx={styles.card}>
      <CardActionArea onClick={onOpen} sx={styles.action} aria-label={`Открыть курс «${course.title}»`}>
        <Box sx={styles.top}><SchoolOutlined sx={styles.icon} /></Box>
        <Typography variant="h6" component="h2" sx={styles.title}>{course.title}</Typography>
        {course.description && <Typography variant="body2" sx={styles.description}>{course.description}</Typography>}
        <Box sx={styles.meta}>
          <Typography variant="body2" component="span" sx={styles.metaItem}><AutoStoriesOutlined fontSize="small" />{formatLessonCount(course.lessonCount)}</Typography>
          {course.studentCount !== null && <Typography variant="body2" component="span" sx={styles.metaItem}><GroupOutlined fontSize="small" />{formatStudentCount(course.studentCount)}</Typography>}
        </Box>
        {course.completedLessonCount !== null && <Box sx={styles.progress}>
          <Typography variant="body2">{getCourseProgressLabel(course)}</Typography>
          <LinearProgress variant="determinate" value={course.progressPercent ?? 0} sx={styles.progressBar} aria-label="Прогресс курса" />
        </Box>}
      </CardActionArea>
    </Card>
  );
}
