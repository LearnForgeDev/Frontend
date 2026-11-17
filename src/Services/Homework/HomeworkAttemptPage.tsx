import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Alert, Box, Button, IconButton, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useHomeworkAttempt } from './hooks/useHomeworkAttempt';
import { HOMEWORK_STATUSES } from './homework.const';
import HomeworkQuestionView from './components/HomeworkQuestionView/HomeworkQuestionView';
import HomeworkStudentAnswer from './components/HomeworkStudentAnswer/HomeworkStudentAnswer';

export default function HomeworkAttemptPage() {
  const view = useHomeworkAttempt();
  const attempt = view.attempt;
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [submission, setSubmission] = useState<number | null>(null);
  if (!attempt) {
    return <Box sx={{ p: 3 }}>{view.state.error ? <Alert severity="error" action={<Button onClick={() => void view.refresh()}>Повторить</Button>}>{view.state.error}</Alert> : <CircularProgress aria-label="Загрузка работы" />}</Box>;
  }
  const historical = attempt.submissions.find(item => item.submissionNumber === submission);
  const answers = historical?.answers ?? attempt.answers;
  const editable = view.editable && !historical;
  const status = historical?.status ?? attempt.status;
  const score = historical ? historical.score : attempt.score;
  const comment = historical ? historical.reviewComment : attempt.reviewComment;
  const passed = historical ? historical.passed : attempt.passed;
  const base = `/app/schools/${encodeURIComponent(view.schoolPublicId)}/homework/${attempt.homeworkPublicId}`;
  return <Stack spacing={3} sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
    <Stack component="header" direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      <IconButton aria-label="К заданию" title="К заданию" sx={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid', borderColor: 'divider', flexShrink: 0 }} onClick={() => navigate(`${base}?${search.toString()}`)}><ArrowBackRoundedIcon /></IconButton>
      <Typography component="h1" variant="h4" sx={{ flex: '1 1 240px', minWidth: 0, overflowWrap: 'anywhere' }}>{attempt.homework.title}</Typography>
    </Stack>
    <Typography color="text.secondary">Попытка {attempt.attemptNumber} · версия {attempt.version} · {HOMEWORK_STATUSES[status]}</Typography>
    {attempt.homework.activeVersion !== null && attempt.version < attempt.homework.activeVersion && <Alert severity="info">Вы выполняете версию {attempt.version}. Опубликована новая версия {attempt.homework.activeVersion}, ваши ответы останутся в текущей.</Alert>}
    {attempt.homework.publicationState === 'Queued' && <Alert severity="info">Преподаватель подготовил новую версию задания. Вы можете закончить текущую работу.</Alert>}
    {view.state.error && <Alert severity="error" action={<Button onClick={() => void view.save()}>Повторить сохранение</Button>}>{view.state.error}</Alert>}
    {view.storageFailed && <Alert severity="warning">Не удалось сохранить черновик на устройстве. Сохраните ответы перед выходом.</Alert>}
    {view.hasOtherDrafts && <Alert severity="warning" action={<Button onClick={view.downloadDrafts}>Скачать черновики</Button>}>На устройстве есть разные черновики из нескольких вкладок. Восстановлен последний. Остальные сохранены для скачивания.</Alert>}
    {view.seconds !== null && <Alert severity="warning" role="status">{view.seconds > 0 ? `Преподаватель завершает работу. Осталось ${view.seconds} сек. Ответы сохраняются автоматически.` : 'Время вышло. Сервер отправляет сохранённые ответы на проверку.'}</Alert>}
    {attempt.wasForced && <Alert severity="info">Попытка сдана автоматически. Неотвеченные вопросы оценены в ноль баллов.</Alert>}
    {!view.editable && view.dirty && <Alert severity="warning">На устройстве остались изменения, которые не вошли в сданную работу. Их можно скопировать из ответов.</Alert>}
    {attempt.submissions.length > 0 && <TextField select label="История сдач" value={submission ?? 'current'} onChange={event => setSubmission(event.target.value === 'current' ? null : Number(event.target.value))}>
      <MenuItem value="current">Текущая работа</MenuItem>{attempt.submissions.map(item => <MenuItem key={item.submissionNumber} value={item.submissionNumber}>Сдача {item.submissionNumber} · {new Date(item.submittedAt).toLocaleString('ru-RU')}</MenuItem>)}
    </TextField>}
    {score !== null && <Alert severity={passed ? 'success' : 'info'}>Результат: {score} / {historical ? historical.maxScore : attempt.maxScore} баллов.</Alert>}
    {comment && <Alert severity="info">{comment}</Alert>}
    {[...attempt.homework.questions].sort((a, b) => a.position - b.position).map(question => <HomeworkQuestionView key={question.id} question={question} schoolPublicId={view.schoolPublicId} homeworkPublicId={attempt.homeworkPublicId}>
      {view.conflicted.includes(question.id) && <Alert severity="warning" action={<Button onClick={() => view.discardConflict(question.id)}>Загрузить с сервера</Button>}>Этот ответ изменён в другой вкладке. Скопируйте нужный текст перед загрузкой серверного ответа.</Alert>}
      <HomeworkStudentAnswer question={question} answer={answers.find(answer => answer.questionId === question.id)} draft={historical ? undefined : view.answerDraft(question.id)} schoolPublicId={view.schoolPublicId} homeworkPublicId={attempt.homeworkPublicId} attemptPublicId={attempt.publicId}
        disabled={!editable || view.submitting || view.conflicted.includes(question.id)} busy={view.busy} onChange={view.recordAnswer} onUpload={file => void view.upload(question.id, file)} onRemoveFile={id => void view.removeFile(question.id, id)} />
    </HomeworkQuestionView>)}
    {editable && <Stack spacing={1} sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', p: 2, borderTop: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography role="status" color="text.secondary">{view.dirty ? 'Есть несохранённые ответы. Черновик сохранён на устройстве.' : 'Ответы сохранены на сервере.'}</Typography>
      <Stack direction="row" spacing={1}><Button variant="contained" disabled={view.busy || view.conflicted.length > 0} onClick={() => void view.submit()}>Сдать работу</Button><Button disabled={view.busy} onClick={() => void view.save()}>Сохранить ответы</Button></Stack>
    </Stack>}
  </Stack>;
}
