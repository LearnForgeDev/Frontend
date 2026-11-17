import type { CourseProgressPanelProps } from './CourseProgressPanel.type';
import { Box, Button, Chip, LinearProgress, Typography } from '@mui/material';

import { getCourseProgressRows } from '../../utils/courseFormatting';
import CourseState from '../CourseState/CourseState';
import { styles } from './CourseProgressPanel.styles';

export default function CourseProgressPanel({ course, isApproving, onApproveItem }: CourseProgressPanelProps) {
  const rows = getCourseProgressRows(course);
  if (!course.raw.items.length && !course.requiredItemCount) {
    return <CourseState kind="empty" title="Прогресс появится вместе с программой" />;
  }
  if (!rows.length) {
    return <CourseState kind="empty" title="Пока нет данных о прогрессе" description="Прогресс появится после добавления учеников на курс." />;
  }
  return <Box sx={styles.panel}>
    <Typography component="h2" variant="h6" sx={styles.title}>{course.canManage ? 'Прогресс учеников' : 'Мой прогресс'}</Typography>
    <Box component="ul" sx={styles.list}>
      {rows.map(row => <Box component="li" key={row.userPublicId} sx={styles.row}>
        <Typography sx={styles.name}>{row.displayName}</Typography>
        <LinearProgress variant="determinate" value={row.percentage} sx={styles.bar} aria-label={`Прогресс: ${row.displayName}`} />
        <Box sx={styles.summary}><Typography variant="body2" sx={styles.muted}>{row.label}</Typography><Typography sx={styles.percentage}>{row.percentage}%</Typography>{row.isComplete && <Chip label="Пройден" size="small" color="success" variant="outlined" />}</Box>
        {course.canManage && <Box sx={{ gridColumn: '1 / -1', display: 'grid', gap: 1, width: '100%' }}>
          {course.items.filter(item => item.completionRule === 7).map(item => {
            const student = course.students.find(student => student.userPublicId === row.userPublicId);
            const progress = student?.items.find(progress => progress.itemPublicId === item.publicId);
            return <Box key={item.publicId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2">{item.title}{progress?.isCompleted ? ' · Пройден' : ' · Ожидает подтверждения'}</Typography>
              <Button disabled={isApproving || !progress?.isUnlocked && !progress?.isCompleted} aria-label={`${progress?.isCompleted ? 'Сбросить' : 'Подтвердить'} «${item.title}» для ${row.displayName}`} onClick={() => onApproveItem(row.userPublicId, item, progress?.isCompleted ? 0 : 2)}>{progress?.isCompleted ? 'Сбросить' : 'Подтвердить'}</Button>
            </Box>;
          })}
        </Box>}
      </Box>)}
    </Box>
  </Box>;
}
