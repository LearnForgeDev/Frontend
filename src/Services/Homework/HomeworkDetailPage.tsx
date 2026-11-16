import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material';
import { useHomework } from './hooks/useHomework';
import { useHomeworkAttempts } from './hooks/useHomeworkAttempts';
import { useHomeworkRealtime } from './hooks/useHomeworkRealtime';
import { HOMEWORK_STATUSES, PUBLICATION_LABELS } from './homework.const';
import HomeworkCountdown from './components/HomeworkCountdown/HomeworkCountdown';

export default function HomeworkDetailPage() {
  const view = useHomework();
  const homework = view.definition;
  const attempts = useHomeworkAttempts(!homework?.canManage);
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [deleting, setDeleting] = useState(false);
  const { load } = view;
  const { refresh: refreshAttempts } = attempts;
  const refresh = useCallback(async () => {
    await Promise.all([load(), refreshAttempts()]);
  }, [load, refreshAttempts]);
  useHomeworkRealtime(view.schoolPublicId, homework?.publicId ?? '', refresh);
  if (!homework) {
    return <Box sx={{ p: 3 }}>{view.error ? <Alert severity="error" action={<Button onClick={() => void view.load()}>Повторить</Button>}>{view.error}</Alert> : <CircularProgress aria-label="Загрузка задания" />}</Box>;
  }
  const base = `/app/schools/${encodeURIComponent(view.schoolPublicId)}/homework/${homework.publicId}`;
  const originCourse = search.get('course');
  const originItem = search.get('item');
  const courseReturnPath = `/app/schools/${encodeURIComponent(view.schoolPublicId)}/courses/${encodeURIComponent(originCourse ?? '')}${originItem ? `?item=${encodeURIComponent(originItem)}` : ''}`;
  const resume = attempts.attempts.find(attempt => attempt.student.publicId === view.userPublicId && (attempt.status === 0 || attempt.status === 4));
  const open = async () => {
    const attempt = await attempts.start();
    if (attempt) {
      navigate(`${base}/attempts/${attempt.publicId}?${search.toString()}`);
    }
  };
  const edit = async () => {
    if (homework.draftVersion !== null || await view.beginDraft()) {
      navigate(`${base}/edit`);
    }
  };
  const cancel = async () => {
    if (await view.cancelQueue()) {
      navigate(`${base}/edit`);
    }
  };
  const remove = async () => {
    if (await view.remove(homework.publicId)) {
      navigate('/app/schools/' + encodeURIComponent(view.schoolPublicId) + '/homework');
    }
    setDeleting(false);
  };
  return <Stack spacing={3} sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 } }}>
    <Button onClick={() => navigate('..', { relative: 'path' })} sx={{ alignSelf: 'flex-start' }}>Все домашние задания</Button>
    {originCourse && <Button onClick={() => navigate(courseReturnPath)} sx={{ alignSelf: 'flex-start' }}>Вернуться к курсу</Button>}
    {view.error && <Alert severity="error">{view.error}</Alert>}
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}><Typography variant="h4" sx={{ flex: 1 }}>{homework.title}</Typography><Chip label={`Версия ${homework.version}`} />
        {homework.canManage && <Chip label={PUBLICATION_LABELS[homework.publicationState]} />}</Stack>
      {homework.description && <Typography sx={{ whiteSpace: 'pre-wrap' }} color="text.secondary">{homework.description}</Typography>}
      <Typography>Вопросов: {homework.questions.length} · Баллов: {homework.questions.reduce((sum, question) => sum + question.points, 0)} · Проходной балл: {homework.passingScore}</Typography>
      {homework.deadlineUtc && <Typography>Сдать до {new Date(homework.deadlineUtc).toLocaleString('ru-RU')}</Typography>}
      {homework.maxAttempts && <Typography>Максимум попыток: {homework.maxAttempts}</Typography>}
    </Stack>
    {homework.canManage ? <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      <Button variant="contained" disabled={view.busy || homework.publicationState === 'Queued'} onClick={() => void edit()}>Редактировать</Button>
      <Button color="error" disabled={view.busy} onClick={() => setDeleting(true)}>Удалить</Button>
    </Stack> : <Stack spacing={1}>
      {homework.publicationState === 'Queued' && !resume && <Alert severity="info">Новая версия готовится к публикации. Начать попытку можно будет после публикации.</Alert>}
      <Button variant="contained" disabled={attempts.busy || !attempts.isLoaded || (!resume && homework.publicationState === 'Queued')} onClick={() => void open()} sx={{ alignSelf: 'flex-start' }}>{resume ? 'Продолжить попытку' : 'Начать выполнение'}</Button>
    </Stack>}
    {homework.canManage && homework.publicationState === 'Queued' && <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}><Stack spacing={2}>
      <Typography variant="h6">Версия {homework.queuedVersion} ожидает публикации</Typography>
      <Typography color="text.secondary">Публикация произойдёт, когда ученики закончат работу или отключатся. Офлайн-черновики сохранят свою версию.</Typography>
      {homework.blockers.map(blocker => <Stack key={blocker.attemptPublicId} direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <Typography sx={{ flex: 1 }}>{blocker.studentName}</Typography>
        {blocker.forceSubmitAtUtc ? <HomeworkCountdown deadline={blocker.forceSubmitAtUtc} serverTimeUtc={homework.serverTimeUtc} /> : <Button color="warning" disabled={view.busy} onClick={() => void view.forceFinish(blocker.attemptPublicId)}>Завершить через 60 секунд</Button>}
      </Stack>)}
      <Button disabled={view.busy} onClick={() => void cancel()} sx={{ alignSelf: 'flex-start' }}>Отменить публикацию и изменить</Button>
    </Stack></Paper>}
    <Typography variant="h6">{homework.canManage ? 'Работы учеников' : 'Мои попытки'}</Typography>
    {!attempts.isLoaded ? <CircularProgress size={24} aria-label="Загрузка попыток" /> : !attempts.attempts.length ? <Typography color="text.secondary">Попыток пока нет.</Typography> : attempts.attempts.map(attempt => <Paper variant="outlined" key={attempt.publicId} sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}><Typography>{homework.canManage && `${attempt.student.name} · `}Попытка {attempt.attemptNumber}, версия {attempt.version}</Typography><Typography variant="body2" color="text.secondary">{HOMEWORK_STATUSES[attempt.status]}{attempt.score !== null ? ` · ${attempt.score} / ${attempt.maxScore}` : ''}</Typography></Box>
        <Button onClick={() => navigate(`${base}/attempts/${attempt.publicId}${homework.canManage ? '/review' : ''}?${search.toString()}`)}>{homework.canManage ? 'Открыть работу' : 'Открыть'}</Button>
      </Stack>
      {homework.canManage && attempt.forceSubmitAtUtc && (attempt.status === 0 || attempt.status === 4) && <Stack spacing={0.5} sx={{ mt: 1.5 }}>
        <Typography variant="body2">Автосдача до <Box component="time" dateTime={attempt.forceSubmitAtUtc}>{new Date(attempt.forceSubmitAtUtc).toLocaleString('ru-RU')}</Box></Typography>
        <HomeworkCountdown deadline={attempt.forceSubmitAtUtc} serverTimeUtc={attempt.serverTimeUtc} />
      </Stack>}
    </Paper>)}
    <Dialog open={deleting} onClose={() => setDeleting(false)}><DialogTitle>Удалить задание?</DialogTitle><DialogContent>Задание с попытками учеников или ссылками из курса удалить нельзя.</DialogContent><DialogActions><Button onClick={() => setDeleting(false)}>Отмена</Button><Button color="error" disabled={view.busy} onClick={() => void remove()}>Удалить</Button></DialogActions></Dialog>
  </Stack>;
}
