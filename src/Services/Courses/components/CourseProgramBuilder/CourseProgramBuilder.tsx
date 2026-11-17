import { useState } from 'react';
import { Add, ArrowDownward, ArrowUpward, Close } from '@mui/icons-material';
import { Alert, Autocomplete, Box, Button, IconButton, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { CourseProgramBuilderProps } from './CourseProgramBuilder.type';
import type { CourseBlock, CourseResourceOption } from '../../Courses.type';
import { COURSE_COMPLETION_OPTIONS, OPTIONAL_COMPLETION } from '../../utils/courseCompletion.const';
import { courseBlockTitle, fromLocalDateTime, toLocalDateTime } from '../../utils/courseProgram.conversion';

const BLOCK_LABELS = ['Файл', 'Занятие', 'Статья', 'Домашнее задание'];

export default function CourseProgramBuilder({ blocks, resources, disabled, onChange }: CourseProgramBuilderProps) {
  const [type, setType] = useState(2);
  const [selected, setSelected] = useState<CourseResourceOption | null>(null);
  const options = resources.filter(option => option.reference.itemType === type);
  const update = (next: CourseBlock) => onChange(blocks.map(block => block.clientId === next.clientId ? next : block));
  const move = (index: number, direction: -1 | 1) => {
    const next = [...blocks];
    const destination = index + direction;
    if (destination < 0 || destination >= next.length) {
      return;
    }
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next);
  };
  const add = () => {
    if (selected) {
      onChange([...blocks, { kind: 'supported', clientId: crypto.randomUUID(), publicId: null, input: { ...selected.reference } }]);
    }
  };
  return <Box sx={{ display: 'grid', gap: 2 }}>
    <Box>
      <Typography component="h3" variant="h6">Программа курса</Typography>
      <Typography color="text.secondary" variant="body2">Соберите последовательный путь. Следующий блок откроется после прохождения предыдущих обязательных блоков.</Typography>
    </Box>
    <ToggleButtonGroup exclusive value={type} disabled={disabled} aria-label="Тип нового блока" onChange={(_, value: number | null) => {
      if (value !== null) {
        setType(value);
        setSelected(null);
      }
    }} sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {BLOCK_LABELS.map((label, index) => <ToggleButton key={label} value={index} sx={{ textTransform: 'none', flexGrow: 1 }}>{label}</ToggleButton>)}
    </ToggleButtonGroup>
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Autocomplete options={options} value={selected} onChange={(_, option) => setSelected(option)} disabled={disabled}
        isOptionEqualToValue={(a, b) => a.key === b.key} getOptionLabel={option => option.title}
        noOptionsText={type === 3 ? 'Нет опубликованных заданий с доступом для вас' : 'Нет доступных ресурсов'}
        openText="Открыть список" closeText="Закрыть список" clearText="Сбросить выбор" sx={{ flex: 1 }}
        renderInput={params => <TextField {...params} label={`Выберите: ${BLOCK_LABELS[type].toLocaleLowerCase('ru')}`} />} />
      <Button variant="outlined" startIcon={<Add />} onClick={add} disabled={disabled || !selected}>Добавить</Button>
    </Box>
    <Typography variant="caption" color="text.secondary">Доступ к исходным статьям, занятиям и заданиям настраивается отдельно. Добавление блока не меняет их аудиторию.</Typography>
    {!blocks.length && <Alert severity="info">В программе пока нет блоков. Курс можно сохранить и заполнить позже.</Alert>}
    <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 2 }}>
      {blocks.map((block, index) => <Box component="li" key={block.clientId} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography sx={{ flex: 1, fontWeight: 600 }}>{index + 1}. {block.kind === 'supported' ? BLOCK_LABELS[block.input.itemType] : 'Другой блок'}</Typography>
          <IconButton aria-label={`Переместить «${courseBlockTitle(block)}» выше`} disabled={disabled || index === 0} onClick={() => move(index, -1)}><ArrowUpward /></IconButton>
          <IconButton aria-label={`Переместить «${courseBlockTitle(block)}» ниже`} disabled={disabled || index === blocks.length - 1} onClick={() => move(index, 1)}><ArrowDownward /></IconButton>
          <IconButton aria-label={`Убрать «${courseBlockTitle(block)}» из курса`} disabled={disabled} onClick={() => onChange(blocks.filter(item => item.clientId !== block.clientId))}><Close /></IconButton>
        </Box>
        {block.kind === 'unsupported' ? <Alert severity="info">{block.original.title}. Настройки этого типа сохранятся без изменений.</Alert> : <>
          <TextField label="Название блока" required value={block.input.title} disabled={disabled} onChange={event => update({ ...block, input: { ...block.input, title: event.target.value } })} />
          <TextField label="Описание блока" multiline minRows={2} value={block.input.description ?? ''} disabled={disabled} onChange={event => update({ ...block, input: { ...block.input, description: event.target.value || null } })} />
          <TextField select label="Условие прохождения" value={block.input.completionRule} disabled={disabled} slotProps={{ select: { native: true } }} onChange={event => {
            const rule = [...COURSE_COMPLETION_OPTIONS[block.input.itemType], OPTIONAL_COMPLETION].find(option => option.value === Number(event.target.value));
            if (rule) {
              update({ ...block, input: { ...block.input, completionRule: rule.value, isRequired: rule.value !== 0, requiredSeconds: rule.value === 2 ? block.input.requiredSeconds ?? 60 : null, completeAfterUtc: rule.value === 6 ? block.input.completeAfterUtc : null } });
            }
          }}>
            {[...COURSE_COMPLETION_OPTIONS[block.input.itemType], OPTIONAL_COMPLETION].map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </TextField>
          {block.input.completionRule === 2 && <TextField type="number" label="Время в статье, минут" value={(block.input.requiredSeconds ?? 60) / 60} disabled={disabled} slotProps={{ htmlInput: { min: 1, max: 1440, step: 1 } }} helperText="Считаем время, пока статья открыта во вкладке. Время разных посещений складывается." onChange={event => update({ ...block, input: { ...block.input, requiredSeconds: Number(event.target.value) * 60 } })} />}
          {block.input.completionRule === 6 && <TextField type="datetime-local" required label="Засчитать после" value={toLocalDateTime(block.input.completeAfterUtc)} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} onChange={event => update({ ...block, input: { ...block.input, completeAfterUtc: fromLocalDateTime(event.target.value) } })} />}
          {block.input.completionRule === 0 && <Typography variant="caption" color="text.secondary">Этот блок можно пропустить. Он не влияет на прогресс курса и не задерживает открытие следующих блоков.</Typography>}
          {block.input.completionRule === 4 && <Typography variant="caption" color="text.secondary">Задание должно быть проверено с проходным баллом.</Typography>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField type="datetime-local" label="Доступен с" value={toLocalDateTime(block.input.availableFromUtc)} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} onChange={event => update({ ...block, input: { ...block.input, availableFromUtc: fromLocalDateTime(event.target.value) } })} />
            <TextField type="datetime-local" label="Доступен до" value={toLocalDateTime(block.input.availableUntilUtc)} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} onChange={event => update({ ...block, input: { ...block.input, availableUntilUtc: fromLocalDateTime(event.target.value) } })} />
          </Box>
        </>}
      </Box>)}
    </Box>
  </Box>;
}
