import { useNavigate } from 'react-router-dom';
import dynamic from 'next/dynamic';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { useHomeworkAttempt } from './hooks/useHomeworkAttempt';
import { useHomeworkReview } from './hooks/useHomeworkReview';
import { HOMEWORK_STATUSES } from './homework.const';
import HomeworkQuestionView from './components/HomeworkQuestionView/HomeworkQuestionView';
import HomeworkAttachment from './components/HomeworkAttachment/HomeworkAttachment';

const RichTextEditor = dynamic(() => import('@/Assets/Components/RichTextEditor/RichTextEditor'), { ssr: false });

export default function HomeworkReviewPage() {
  const view = useHomeworkAttempt();
  const attempt = view.attempt;
  const review = useHomeworkReview(attempt);
  const navigate = useNavigate();
  if (!attempt) {
    return <Box sx={{ p: 3 }}>{view.state.error ? <Alert severity="error" action={<Button onClick={() => void view.refresh()}>Повторить</Button>}>{view.state.error}</Alert> : <CircularProgress aria-label="Загрузка работы ученика" />}</Box>;
  }
  if (!attempt.homework.canManage) {
    return <Alert severity="error">Проверка недоступна.</Alert>;
  }
  const editable = attempt.status === 1 || attempt.status === 2;
  const locked = !editable || review.busy;
  return <Stack spacing={3} sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 } }}>
    <Button sx={{ alignSelf: 'flex-start' }} onClick={() => navigate(`/app/schools/${encodeURIComponent(view.schoolPublicId)}/homework/${attempt.homeworkPublicId}`)}>К работам учеников</Button>
    <Typography variant="h4">{attempt.homework.title}</Typography><Typography variant="h6">{attempt.student.name}</Typography>
    <Typography color="text.secondary">Попытка {attempt.attemptNumber} · версия {attempt.version} · {HOMEWORK_STATUSES[attempt.status]}</Typography>
    {review.error && <Alert severity="error" action={<Button onClick={() => {
      review.discard();
      void view.refresh();
    }}>Загрузить серверный черновик</Button>}>{review.error} Скопируйте нужные комментарии перед загрузкой серверного черновика.</Alert>}
    {editable && <Alert severity="info">Баллы, комментарии и отметки остаются приватными до завершения проверки или возврата на доработку.</Alert>}
    {attempt.wasForced && <Alert severity="warning">Сдано автоматически. Пропущенные обязательные ответы получили ноль баллов.</Alert>}
    {[...attempt.homework.questions].sort((a, b) => a.position - b.position).map(question => {
      const answer = attempt.answers.find(item => item.questionId === question.id);
      const assessment = review.review.answers.find(item => item.questionId === question.id);
      const change = (fields: { score?: number | null; teacherComment?: string | null; annotations?: NonNullable<typeof assessment>['annotations'] }) => review.change({ ...review.review, answers: review.review.answers.map(item => item.questionId === question.id ? { ...item, ...fields } : item) });
      const chosen = question.options.filter(option => answer?.selectedOptionIds.includes(option.id));
      return <HomeworkQuestionView key={question.id} teacher question={question} schoolPublicId={view.schoolPublicId} homeworkPublicId={attempt.homeworkPublicId}>
        {question.questionType < 2 && <Stack spacing={1}><Typography variant="subtitle2">Выбранные варианты</Typography>{chosen.length ? chosen.map(option => <Typography key={option.id}>{option.text}</Typography>) : <Typography color="text.secondary">Нет ответа</Typography>}
          <Typography variant="body2" color="text.secondary">Правильные: {question.options.filter(option => option.isCorrect).map(option => option.text).join(', ')}</Typography></Stack>}
        {(question.questionType === 2 || question.questionType === 3) && (answer?.richText ? <RichTextEditor value={answer.richText} readOnly label="Ответ ученика" /> : <Typography sx={{ whiteSpace: 'pre-wrap' }}>{answer?.textValue || 'Нет ответа'}</Typography>)}
        {(answer?.files ?? []).map(file => <HomeworkAttachment key={file.publicId} schoolPublicId={view.schoolPublicId} homeworkPublicId={attempt.homeworkPublicId} attemptPublicId={attempt.publicId} questionId={question.id} file={file} annotations={assessment?.annotations ?? answer?.annotations ?? []}
          readOnly={locked} onAnnotations={annotations => change({ annotations })} />)}
        <TextField label={`Баллы за вопрос ${question.position + 1}`} type="number" value={assessment?.score ?? ''} disabled={locked} slotProps={{ htmlInput: { min: 0, max: question.points, step: 0.25 } }} helperText={`Максимум ${question.points}`} onChange={event => change({ score: event.target.value === '' ? null : Number(event.target.value) })} />
        <TextField label="Комментарий к ответу" multiline minRows={2} value={assessment?.teacherComment ?? ''} disabled={locked} onChange={event => change({ teacherComment: event.target.value })} />
      </HomeworkQuestionView>;
    })}
    <TextField label="Общий комментарий" multiline minRows={3} value={review.review.reviewComment ?? ''} disabled={locked} onChange={event => review.change({ ...review.review, reviewComment: event.target.value })} />
    <Typography variant="h6">Итого: {review.review.answers.reduce((sum, answer) => sum + (answer.score ?? 0), 0)} / {attempt.homework.questions.reduce((sum, question) => sum + question.points, 0)}</Typography>
    {editable && <Stack spacing={1} sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', p: 2, borderTop: 1, borderColor: 'divider', borderRadius: 2 }}>
      <FormControlLabel label="Вернуть на доработку" control={<Checkbox checked={review.review.returnForRevision} disabled={review.busy} onChange={(_, returnForRevision) => review.change({ ...review.review, returnForRevision })} />} />
      <Typography role="status" color="text.secondary">{review.hasChanges ? 'Есть несохранённые изменения проверки.' : 'Черновик проверки сохранён.'}</Typography>
      <Stack direction="row" spacing={1}><Button variant="contained" disabled={review.busy} onClick={() => void review.save(true)}>{review.review.returnForRevision ? 'Вернуть ученику' : 'Завершить проверку'}</Button><Button disabled={review.busy} onClick={() => void review.save()}>Сохранить приватный черновик</Button></Stack>
    </Stack>}
  </Stack>;
}
