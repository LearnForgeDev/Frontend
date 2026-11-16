import dynamic from 'next/dynamic';
import { Alert, Button, Checkbox, FormControl, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { richTextFromText } from '@/Assets/Components/RichTextEditor/RichTextEditor.utils';
import HomeworkAttachment from '../HomeworkAttachment/HomeworkAttachment';
import type { HomeworkStudentAnswerProps } from './HomeworkStudentAnswer.type';

const RichTextEditor = dynamic(() => import('@/Assets/Components/RichTextEditor/RichTextEditor'), { ssr: false });

export default function HomeworkStudentAnswer(props: HomeworkStudentAnswerProps) {
  const { question, answer, draft, disabled, busy, onChange, onUpload, onRemoveFile } = props;
  const value = draft ?? answer;
  const selected = value?.selectedOptionIds ?? [];
  const change = (input: { textValue?: string | null; selectedOptionIds?: number[] }) => onChange({ questionId: question.id, textValue: value?.textValue, richText: value?.richText, selectedOptionIds: selected, ...input });
  return <Stack spacing={2}>
    {question.questionType === 0 && <FormControl component="fieldset"><Typography component="legend" variant="body2">Выберите варианты ответа</Typography>{question.options.map(option => <FormControlLabel key={option.id} label={option.text} control={<Checkbox disabled={disabled} checked={selected.includes(option.id)} onChange={(_, checked) => change({ selectedOptionIds: checked ? [...selected, option.id] : selected.filter(id => id !== option.id) })} />} />)}</FormControl>}
    {question.questionType === 1 && <FormControl component="fieldset"><Typography component="legend" variant="body2">Выберите один вариант</Typography><RadioGroup value={selected[0] ?? ''} onChange={(_, next) => change({ selectedOptionIds: [Number(next)] })}>{question.options.map(option => <FormControlLabel key={option.id} value={option.id} label={option.text} control={<Radio disabled={disabled} />} />)}</RadioGroup></FormControl>}
    {question.questionType === 2 && <TextField label="Ваш ответ" disabled={disabled} value={value?.textValue ?? ''} onChange={event => change({ textValue: event.target.value })} />}
    {question.questionType === 3 && <RichTextEditor label="Ваш развёрнутый ответ" readOnly={disabled} value={value?.richText ?? richTextFromText(value?.textValue ?? '')} onChange={(richText, textValue) => onChange({ questionId: question.id, richText, textValue, selectedOptionIds: [] })} />}
    {question.questionType === 4 && <>
      <Typography color="text.secondary" variant="body2">Прикрепите фото работы или файл. До 5 файлов, каждый до 20 МБ.</Typography>
      {(answer?.files ?? []).map(file => <HomeworkAttachment key={file.publicId} schoolPublicId={props.schoolPublicId} homeworkPublicId={props.homeworkPublicId} attemptPublicId={props.attemptPublicId} questionId={question.id} file={file} annotations={answer?.annotations ?? []} onRemove={disabled || busy ? undefined : () => onRemoveFile(file.publicId)} />)}
      {!disabled && <Button component="label" variant="outlined" disabled={busy || (answer?.files.length ?? 0) >= 5} sx={{ alignSelf: 'flex-start' }}>Прикрепить файл<input hidden type="file" accept="image/*,application/pdf,text/*,application/zip,application/vnd.*" onChange={event => {
        const file = event.target.files?.[0];
        if (file) {
          onUpload(file);
        }
        event.target.value = '';
      }} /></Button>}
    </>}
    {answer?.teacherComment && <Alert severity="info"><Typography variant="subtitle2">Комментарий преподавателя</Typography>{answer.teacherComment}</Alert>}
    {answer?.score !== null && answer?.score !== undefined && <Typography>Баллы: {answer.score} / {question.points}</Typography>}
  </Stack>;
}
