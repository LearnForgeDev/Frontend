import { useState } from 'react';
import { Button, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
import type { HomeworkMetadataProps } from './HomeworkMetadata.type';

function localDate(value: string | null | undefined) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function HomeworkMetadata({ definition, busy, onSave, onDirtyChange }: HomeworkMetadataProps) {
  const [title, setTitle] = useState(definition?.title ?? '');
  const [description, setDescription] = useState(definition?.description ?? '');
  const [passingScore, setPassingScore] = useState(definition?.passingScore ?? 0);
  const [useTotalPassingScore, setUseTotalPassingScore] = useState(definition?.useTotalPassingScore ?? true);
  const [maxAttempts, setMaxAttempts] = useState(definition?.maxAttempts?.toString() ?? '');
  const [deadline, setDeadline] = useState(localDate(definition?.deadlineUtc));
  const totalPoints = definition?.questions.reduce((sum, question) => sum + question.points, 0) ?? 0;
  const threshold = useTotalPassingScore ? totalPoints : passingScore;
  const valid = title.trim() && Number.isFinite(threshold) && threshold >= 0
    && (!maxAttempts || (Number.isInteger(Number(maxAttempts)) && Number(maxAttempts) > 0));
  const save = async () => {
    const result = await onSave({ title: title.trim(), description: description.trim() || null, passingScore: threshold, useTotalPassingScore, maxAttempts: maxAttempts ? Number(maxAttempts) : null, deadlineUtc: deadline ? new Date(deadline).toISOString() : null });
    if (result !== null) {
      onDirtyChange?.(false);
    }
  };
  return <Stack component="form" spacing={2} onSubmit={event => {
    event.preventDefault();
    if (valid) {
      void save();
    }
  }}>
    <TextField label="Название" required value={title} disabled={busy} onChange={event => {
      setTitle(event.target.value);
      onDirtyChange?.(true);
    }} />
    <TextField label="Описание" multiline minRows={2} value={description} disabled={busy} onChange={event => {
      setDescription(event.target.value);
      onDirtyChange?.(true);
    }} />
    <FormControlLabel label="Проходной балл равен сумме баллов" control={<Checkbox disabled={busy} checked={useTotalPassingScore} onChange={(_, checked) => {
      if (!checked) {
        setPassingScore(threshold);
      }
      setUseTotalPassingScore(checked);
      onDirtyChange?.(true);
    }} />} />
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <TextField label="Проходной балл" type="number" value={threshold} disabled={busy || useTotalPassingScore} helperText={useTotalPassingScore ? 'Пересчитывается при изменении вопросов' : undefined} slotProps={{ htmlInput: { min: 0, step: 0.25 } }} onChange={event => {
        setPassingScore(Number(event.target.value));
        onDirtyChange?.(true);
      }} />
      <TextField label="Максимум попыток" type="number" value={maxAttempts} disabled={busy} helperText="Пусто — без ограничения" slotProps={{ htmlInput: { min: 1, step: 1 } }} onChange={event => {
        setMaxAttempts(event.target.value);
        onDirtyChange?.(true);
      }} />
      <TextField label="Срок сдачи" type="datetime-local" value={deadline} disabled={busy} slotProps={{ inputLabel: { shrink: true } }} helperText="В вашем часовом поясе" onChange={event => {
        setDeadline(event.target.value);
        onDirtyChange?.(true);
      }} />
    </Stack>
    <Button type="submit" variant="contained" disabled={busy || !valid} sx={{ alignSelf: 'flex-start' }}>{definition ? 'Сохранить настройки' : 'Создать домашнее задание'}</Button>
  </Stack>;
}
