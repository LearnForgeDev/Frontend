import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import type { CourseStudentOption } from '@/Endpoints/courses';
import { styles } from './CourseStudentPicker.styles';

interface CourseStudentPickerProps {
  options: CourseStudentOption[];
  selectedIds: string[];
  onChange: (studentPublicIds: string[]) => void;
  disabled: boolean;
}

export default function CourseStudentPicker({ options, selectedIds, onChange, disabled }: CourseStudentPickerProps) {
  const selected = options.filter(student => selectedIds.includes(student.userPublicId));
  return <Box sx={styles.root}>
    <Typography component="h3" variant="subtitle1" sx={styles.title}>Ученики</Typography>
    <Autocomplete multiple options={options} value={selected} disabled={disabled} filterSelectedOptions
      getOptionLabel={option => option.displayName} isOptionEqualToValue={(a, b) => a.userPublicId === b.userPublicId}
      onChange={(_, value) => onChange(value.map(student => student.userPublicId))}
      noOptionsText="Доступных учеников нет" openText="Выбрать учеников" closeText="Закрыть" clearText="Убрать всех учеников"
      renderInput={params => <TextField {...params} label="Ученики школы" placeholder="Найти ученика" />} />
    <Typography variant="body2" sx={styles.hint}>Курс доступен выбранным ученикам.</Typography>
  </Box>;
}
