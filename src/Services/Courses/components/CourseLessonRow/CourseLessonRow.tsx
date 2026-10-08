import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import type { CourseLesson } from '@/Endpoints/courses';
import { styles } from './CourseLessonRow.styles';

interface CourseLessonRowProps {
  lesson: CourseLesson;
  ordinal: number;
  canManage: boolean;
  isSavingProgress: boolean;
  onOpen: () => void;
  onToggleCompleted: () => void;
}

export default function CourseLessonRow({ lesson, ordinal, canManage, isSavingProgress, onOpen, onToggleCompleted }: CourseLessonRowProps) {
  return <Box component="li" sx={styles.row}>
    <Box sx={styles.number} aria-hidden="true">{ordinal}</Box>
    <Typography sx={styles.name}>{lesson.title}</Typography>
    <Box sx={styles.actions}>
      {!canManage && <FormControlLabel sx={styles.completion} label={lesson.isCompleted ? 'Пройден' : 'Отметить пройденным'} control={<Checkbox checked={lesson.isCompleted} onChange={onToggleCompleted} disabled={isSavingProgress} slotProps={{ input: { 'aria-label': `Урок «${lesson.title}» пройден` } }} />} />}
      <Button onClick={onOpen} endIcon={<ArrowForward />} sx={styles.button}>Открыть</Button>
    </Box>
  </Box>;
}
