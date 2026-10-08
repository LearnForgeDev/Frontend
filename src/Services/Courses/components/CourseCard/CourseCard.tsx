import { Box, Card, CardActionArea, LinearProgress, Typography } from '@mui/material';
import { ArrowForward, AutoStoriesOutlined, GroupOutlined, SchoolOutlined } from '@mui/icons-material';
import type { CourseSummary } from '@/Endpoints/courses';
import { formatLessonCount, formatStudentCount, getCourseProgress, getCourseProgressLabel } from '../../utils/courseFormatting';
import { styles } from './CourseCard.styles';

interface CourseCardProps {
  course: CourseSummary;
  onOpen: () => void;
}

export default function CourseCard({ course, onOpen }: CourseCardProps) {
  return (
    <Card variant="outlined" sx={styles.card}>
      <CardActionArea onClick={onOpen} sx={styles.action} aria-label={`Открыть курс «${course.title}»`}>
        <Box sx={styles.top}><SchoolOutlined sx={styles.icon} /><ArrowForward sx={styles.arrow} /></Box>
        <Typography variant="h6" component="h2" sx={styles.title}>{course.title}</Typography>
        {course.description && <Typography variant="body2" sx={styles.description}>{course.description}</Typography>}
        <Box sx={styles.meta}>
          <Typography variant="body2" component="span" sx={styles.metaItem}><AutoStoriesOutlined fontSize="small" />{formatLessonCount(course.lessonCount)}</Typography>
          <Typography variant="body2" component="span" sx={styles.metaItem}><GroupOutlined fontSize="small" />{formatStudentCount(course.studentCount)}</Typography>
        </Box>
        {course.completedLessonCount !== null && <Box sx={styles.progress}>
          <Typography variant="body2">{getCourseProgressLabel(course)}</Typography>
          <LinearProgress variant="determinate" value={getCourseProgress(course.completedLessonCount, course.lessonCount)} sx={styles.progressBar} aria-label="Прогресс курса" />
        </Box>}
      </CardActionArea>
    </Card>
  );
}
