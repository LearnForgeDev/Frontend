import { Autocomplete, Box, Button, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';
import type { Member } from '../../Scheduling.types';
import { ATTENDEE_PICKER_TEXT as text } from './EventAttendeePicker.const';
import { styles } from './EventAttendeePicker.styles';

interface EventAttendeePickerProps {
  options: Member[];
  selected: Member[];
  disabled: boolean;
  hasStudents: boolean;
  withoutAttendees: boolean;
  onChange: (ids: string[]) => void;
  onSelectAll: () => void;
  onWithoutAttendeesChange: (value: boolean) => void;
}

export function EventAttendeePicker({ options, selected, disabled, hasStudents, withoutAttendees, onChange, onSelectAll, onWithoutAttendeesChange }: EventAttendeePickerProps) {
  return <Box sx={styles.root}>
    <Autocomplete multiple options={options} value={selected} disabled={disabled || withoutAttendees} filterSelectedOptions
      getOptionLabel={option => option.displayName} isOptionEqualToValue={(first, second) => first.userPublicId === second.userPublicId}
      onChange={(_, value) => onChange(value.map(attendee => attendee.userPublicId))}
      noOptionsText={text.empty} openText={text.open} closeText={text.close} clearText={text.clear}
      renderInput={params => <TextField {...params} label={text.label} />} />
    <Box sx={styles.summary}>
      <Typography variant="body2" color="text.secondary" role="status">{text.count}: {selected.length}</Typography>
      <Button onClick={onSelectAll} disabled={disabled || !hasStudents}>{text.all}</Button>
    </Box>
    <FormControlLabel control={<Checkbox checked={withoutAttendees} onChange={(_, checked) => onWithoutAttendeesChange(checked)} disabled={disabled} />} label={text.without} />
  </Box>;
}
