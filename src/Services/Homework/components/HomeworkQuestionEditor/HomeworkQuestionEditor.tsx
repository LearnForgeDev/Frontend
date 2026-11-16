import dynamic from 'next/dynamic';
import { Alert, Box, Button, Checkbox, FormControlLabel, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { richTextFromText } from '@/Assets/Components/RichTextEditor/RichTextEditor.utils';
import { HOMEWORK_QUESTION_TYPES } from '../../homework.const';
import { validateQuestion } from '../../homework.validation';
import { useHomeworkQuestion } from '../../hooks/useHomeworkQuestion';
import HomeworkHint from '../HomeworkHint/HomeworkHint';
import type { HomeworkQuestionEditorProps } from './HomeworkQuestionEditor.type';

const RichTextEditor = dynamic(() => import('@/Assets/Components/RichTextEditor/RichTextEditor'), { ssr: false });

export default function HomeworkQuestionEditor(props: HomeworkQuestionEditorProps) {
  const { question: source, homeworkId, version, position, onSave, onCancel, busy } = props;
  const draft = useHomeworkQuestion(homeworkId, version, source, position);
  const question = draft.question;
  const error = validateQuestion(question);
  const choice = question.questionType === 0 || question.questionType === 1;
  const save = async () => {
    if (await onSave(question)) {
      draft.clear();
    }
  };
  return <Paper component="section" variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center' }}><Typography variant="h6" sx={{ flex: 1 }}>{source ? 'Редактирование вопроса' : 'Новый вопрос'}</Typography>
        <HomeworkHint editing disabled={busy} studentHint={question.studentHint} teacherHint={question.teacherHint} onChange={(studentHint, teacherHint) => draft.change({ ...question, studentHint, teacherHint })} />
      </Stack>
      <TextField select label="Тип ответа" disabled={busy} value={question.questionType} onChange={event => {
        const selected = HOMEWORK_QUESTION_TYPES.find(type => type.value === Number(event.target.value));
        if (selected && (selected.value === 0 || selected.value === 1 || selected.value === 2 || selected.value === 3 || selected.value === 4)) {
          draft.change({ ...question, questionType: selected.value, options: selected.value < 2 ? question.options : [] });
        }
      }}>{HOMEWORK_QUESTION_TYPES.map(type => <MenuItem value={type.value} key={type.value}>{type.label}</MenuItem>)}</TextField>
      <RichTextEditor label="Текст вопроса" value={question.richText ?? richTextFromText(question.text)} readOnly={busy} onChange={(richText, text) => draft.change({ ...question, richText, text })} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField label="Максимум баллов" type="number" value={question.points} disabled={busy} slotProps={{ htmlInput: { min: 0, step: 0.25 } }} onChange={event => draft.change({ ...question, points: Number(event.target.value) })} />
        <FormControlLabel label="Обязательный вопрос" control={<Checkbox disabled={busy} checked={question.isRequired} onChange={(_, isRequired) => draft.change({ ...question, isRequired })} />} />
      </Stack>
      {choice && <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">Отметьте правильные варианты. Они доступны только преподавателю.</Typography>
        {question.options.map((option, index) => <Stack direction="row" key={option.id ?? `new-${index}`} spacing={1} sx={{ alignItems: 'center' }}>
          <Checkbox checked={option.isCorrect} disabled={busy} slotProps={{ input: { 'aria-label': `Правильный вариант ${index + 1}` } }} onChange={(_, checked) => draft.change({ ...question, options: question.options.map((item, position) => ({ ...item, isCorrect: question.questionType === 1 ? position === index && checked : position === index ? checked : item.isCorrect })) })} />
          <TextField fullWidth label={`Вариант ${index + 1}`} value={option.text} disabled={busy} onChange={event => draft.change({ ...question, options: question.options.map((item, position) => position === index ? { ...item, text: event.target.value } : item) })} />
          <IconButton disabled={busy} aria-label={`Удалить вариант ${index + 1}`} onClick={() => draft.change({ ...question, options: question.options.filter((_, position) => position !== index).map((item, position) => ({ ...item, position })) })}><DeleteOutlinedIcon /></IconButton>
        </Stack>)}
        <Box><Button disabled={busy} onClick={() => draft.change({ ...question, options: [...question.options, { position: question.options.length, text: '', value: null, isCorrect: false }] })}>Добавить вариант</Button></Box>
      </Stack>}
      {error && <Alert severity="info">{error}</Alert>}
      <Stack direction="row" spacing={1}><Button variant="contained" disabled={busy || Boolean(error)} onClick={() => void save()}>Сохранить вопрос</Button><Button disabled={busy} onClick={() => {
        draft.clear();
        onCancel();
      }}>Отмена</Button></Stack>
    </Stack>
  </Paper>;
}
