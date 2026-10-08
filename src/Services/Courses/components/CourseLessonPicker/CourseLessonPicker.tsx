import { Autocomplete, Box, IconButton, TextField, Typography } from '@mui/material';
import { ArrowDownward, ArrowUpward, Close } from '@mui/icons-material';
import type { LessonOption } from '../../Courses.types';
import { styles } from './CourseLessonPicker.styles';

interface CourseLessonPickerProps {
  options: LessonOption[];
  selected: LessonOption[];
  onChange: (lessonIds: number[]) => void;
  onMove: (lessonId: number, direction: -1 | 1) => void;
  disabled: boolean;
}

export default function CourseLessonPicker({ options, selected, onChange, onMove, disabled }: CourseLessonPickerProps) {
  return (
    <Box sx={styles.root}>
      <Typography component="h3" variant="subtitle1" sx={styles.title}>Программа курса</Typography>
      <Autocomplete multiple options={options} value={selected} disabled={disabled} filterSelectedOptions
        getOptionLabel={option => option.title} isOptionEqualToValue={(a, b) => a.lessonId === b.lessonId}
        onChange={(_, value) => onChange(value.map(lesson => lesson.lessonId))}
        noOptionsText="Доступных уроков нет" openText="Выбрать уроки" closeText="Закрыть" clearText="Убрать все уроки"
        renderInput={params => <TextField {...params} label="Уроки школы" placeholder="Найти урок" />} />
      <Box component="ol" sx={styles.list}>
        {selected.map((lesson, index) => <Box component="li" key={lesson.lessonId} sx={styles.row}>
          <Typography variant="body2" sx={styles.number}>{index + 1}</Typography>
          <Typography variant="body2" sx={styles.name}>{lesson.title}</Typography>
          <Box sx={styles.actions}>
            <IconButton size="small" disabled={disabled || index === 0} aria-label={`Переместить «${lesson.title}» выше`} onClick={() => onMove(lesson.lessonId, -1)}><ArrowUpward fontSize="small" /></IconButton>
            <IconButton size="small" disabled={disabled || index === selected.length - 1} aria-label={`Переместить «${lesson.title}» ниже`} onClick={() => onMove(lesson.lessonId, 1)}><ArrowDownward fontSize="small" /></IconButton>
            <IconButton size="small" disabled={disabled} aria-label={`Убрать «${lesson.title}» из курса`} onClick={() => onChange(selected.filter(item => item.lessonId !== lesson.lessonId).map(item => item.lessonId))}><Close fontSize="small" /></IconButton>
          </Box>
        </Box>)}
      </Box>
      {selected.length === 0 && <Typography variant="body2" sx={styles.hint}>Уроки можно добавить позже.</Typography>}
    </Box>
  );
}
