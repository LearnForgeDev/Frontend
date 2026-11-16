import { useState } from 'react';
import { Alert, Autocomplete, Button, Stack, TextField, Typography } from '@mui/material';
import { useHomeworkAudience } from '../../hooks/useHomeworkAudience';
import type { HomeworkAudienceProps } from './HomeworkAudience.type';

export default function HomeworkAudience({ definition, busy, onSave, onDirtyChange }: HomeworkAudienceProps) {
  const audience = useHomeworkAudience();
  const [users, setUsers] = useState(definition.allowedUserPublicIds ?? []);
  const [groups, setGroups] = useState(definition.allowedGroupIds);
  const missingUsers = users.filter(id => !audience.students.some(student => student.publicId === id)).map(publicId => ({ publicId, name: publicId }));
  const missingGroups = groups.filter(id => !audience.groups.some(group => group.id === id)).map(id => ({ id, name: `Группа ${id}` }));
  const students = [...audience.students, ...missingUsers];
  const availableGroups = [...audience.groups, ...missingGroups];
  const save = async () => {
    const result = await onSave({ allowedUserPublicIds: users, allowedGroupIds: groups });
    if (result !== null) {
      onDirtyChange?.(false);
    }
  };
  return <Stack spacing={2}>
    <Typography variant="h6">Кому доступно задание</Typography>
    <Alert severity="info">Если ученики и группы не выбраны, задание доступно всей школе. Доступ к курсу настраивается отдельно.</Alert>
    <Autocomplete multiple options={students} value={students.filter(student => users.includes(student.publicId))} getOptionLabel={option => option.name} isOptionEqualToValue={(a, b) => a.publicId === b.publicId}
      openText="Выбрать учеников" closeText="Закрыть" clearText="Убрать всех учеников"
      disabled={busy} onChange={(_, selected) => {
        setUsers(selected.map(student => student.publicId));
        onDirtyChange?.(true);
      }} renderInput={params => <TextField {...params} label="Ученики" />} noOptionsText="Ученики не найдены" />
    <Autocomplete multiple options={availableGroups} value={availableGroups.filter(group => groups.includes(group.id))} getOptionLabel={option => option.name} isOptionEqualToValue={(a, b) => a.id === b.id}
      openText="Выбрать группы" closeText="Закрыть" clearText="Убрать все группы"
      disabled={busy} onChange={(_, selected) => {
        setGroups(selected.map(group => group.id));
        onDirtyChange?.(true);
      }} renderInput={params => <TextField {...params} label="Группы" />} noOptionsText="Группы не найдены" />
    <Button disabled={busy} onClick={() => void save()} sx={{ alignSelf: 'flex-start' }}>Сохранить доступ</Button>
  </Stack>;
}
