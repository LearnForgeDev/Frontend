import { Autocomplete, Box, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import type { CourseInput } from '../../Courses.types';
import type { StudentGroupDto } from '@/Endpoints/students';
import { styles } from './CourseAccessPicker.styles';

interface CourseAccessPickerProps {
  mode: CourseInput['accessMode'];
  onModeChange: (mode: CourseInput['accessMode']) => void;
  groups: StudentGroupDto[];
  selectedGroupIds: number[];
  onGroupsChange: (ids: number[]) => void;
  disabled: boolean;
}

export default function CourseAccessPicker({ mode, onModeChange, groups, selectedGroupIds, onGroupsChange, disabled }: CourseAccessPickerProps) {
  return <Box sx={styles.root}>
    <Typography component="h3" variant="subtitle1" sx={styles.title}>Кому доступен курс</Typography>
    <RadioGroup aria-label="Доступ к курсу" value={mode} onChange={(_, value) => onModeChange(value as CourseInput['accessMode'])}>
      <FormControlLabel value="selected" control={<Radio />} label="Выбранным ученикам и группам" disabled={disabled} />
      <FormControlLabel value="school" control={<Radio />} label="Всей школе" disabled={disabled} />
    </RadioGroup>
    {mode === 'selected' && groups.length > 0 && <Autocomplete multiple options={groups} value={groups.filter(group => selectedGroupIds.includes(group.id))}
      disabled={disabled} filterSelectedOptions getOptionLabel={group => group.name} isOptionEqualToValue={(a, b) => a.id === b.id}
      onChange={(_, selected) => onGroupsChange(selected.map(group => group.id))}
      openText="Выбрать группы" closeText="Закрыть" clearText="Убрать группы" noOptionsText="Группы не найдены"
      renderInput={params => <TextField {...params} label="Группы" />} />}
  </Box>;
}
