import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { useHomework } from './hooks/useHomework';
import { useHomeworkRealtime } from './hooks/useHomeworkRealtime';
import HomeworkAudience from './components/HomeworkAudience/HomeworkAudience';
import HomeworkMetadata from './components/HomeworkMetadata/HomeworkMetadata';
import HomeworkQuestionEditor from './components/HomeworkQuestionEditor/HomeworkQuestionEditor';
import HomeworkHint from './components/HomeworkHint/HomeworkHint';
import HomeworkAttachment from './components/HomeworkAttachment/HomeworkAttachment';
import type { HomeworkQuestion } from '@/Endpoints/Homework/homework.type';
import { nextHomeworkPosition } from './homework.order';

export default function HomeworkEditorPage() {
  const view = useHomework({ draft: true });
  const { homeworkPublicId } = useParams<{ homeworkPublicId: string }>();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<HomeworkQuestion | 'new' | null>(null);
  const [metadataDirty, setMetadataDirty] = useState(false);
  const [audienceDirty, setAudienceDirty] = useState(false);
  const definition = view.definition;
  useHomeworkRealtime(view.schoolPublicId, homeworkPublicId ?? '', view.load);
  const listPath = `/app/schools/${encodeURIComponent(view.schoolPublicId)}/homework`;
  if (!homeworkPublicId) {
    return <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto', p: 3 }}><Button sx={{ alignSelf: 'flex-start' }} onClick={() => navigate(listPath)}>Все задания</Button><Typography variant="h4">Новое домашнее задание</Typography>
      {view.error && <Alert severity="error">{view.error}</Alert>}
      <HomeworkMetadata busy={view.busy} onSave={async metadata => {
        const created = await view.create({ ...metadata, allowedUserPublicIds: [], allowedGroupIds: [] });
        if (created) {
          navigate(`${listPath}/${created.publicId}/edit`);
        }
      }} />
    </Stack>;
  }
  if (!definition) {
    return <Box sx={{ p: 3 }}>{view.error ? <Alert severity="error" action={<Button onClick={() => void view.load()}>Повторить</Button>}>{view.error}</Alert> : <CircularProgress aria-label="Загрузка редактора" />}</Box>;
  }
  if (!definition.canManage) {
    return <Alert severity="error">Редактирование недоступно.</Alert>;
  }
  const disabled = view.busy || !definition.canEditDefinition;
  const questions = [...definition.questions].sort((a, b) => a.position - b.position);
  const publish = async () => {
    if (await view.publish()) {
      navigate(`${listPath}/${homeworkPublicId}`);
    }
  };
  return <Stack spacing={3} sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
    <Button sx={{ alignSelf: 'flex-start' }} onClick={() => navigate(`${listPath}/${homeworkPublicId}`)}>К заданию</Button>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}><Typography variant="h4" sx={{ flex: 1 }}>Редактор задания</Typography>
      <Button variant="contained" disabled={disabled || editing !== null || metadataDirty || audienceDirty || !questions.length} onClick={() => void publish()}>Опубликовать версию {definition.version}</Button>
    </Stack>
    {view.error && <Alert severity="error">{view.error}</Alert>}
    {(metadataDirty || audienceDirty) && <Alert severity="info">Сохраните настройки и доступ перед публикацией.</Alert>}
    {!definition.canEditDefinition && <Alert severity="warning">Эта версия зафиксирована. Вернитесь к заданию, чтобы создать черновик или отменить очередь публикации.</Alert>}
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}><HomeworkMetadata key={`${definition.publicId}:${definition.version}`} definition={definition} busy={disabled} onSave={view.metadata} onDirtyChange={setMetadataDirty} /></Paper>
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}><HomeworkAudience key={`${definition.publicId}:${definition.allowedUserPublicIds?.join()}:${definition.allowedGroupIds.join()}`} definition={definition} busy={view.busy} onSave={view.access} onDirtyChange={setAudienceDirty} /></Paper>
    <Divider />
    <Stack direction="row" sx={{ alignItems: 'center' }}><Typography variant="h5" sx={{ flex: 1 }}>Вопросы</Typography><Typography color="text.secondary">Всего баллов: {questions.reduce((sum, question) => sum + question.points, 0)}</Typography></Stack>
    {questions.map((question, index) => <Paper key={question.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}><Stack spacing={1.5}>
      <Stack direction="row" sx={{ alignItems: 'center' }}><Typography variant="subtitle1" sx={{ flex: 1 }}>{index + 1}. {question.text}</Typography><Typography>{question.points} б.</Typography><HomeworkHint teacher studentHint={question.studentHint} teacherHint={question.teacherHint} /></Stack>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}><Button disabled={disabled || editing !== null} onClick={() => setEditing(question)}>Изменить</Button>
        <Button disabled={disabled || index === 0 || editing !== null} onClick={() => {
          const ids = questions.map(item => item.id);
          [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
          void view.reorder(ids);
        }}>Выше</Button><Button disabled={disabled || index === questions.length - 1 || editing !== null} onClick={() => {
          const ids = questions.map(item => item.id);
          [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
          void view.reorder(ids);
        }}>Ниже</Button><Button color="error" disabled={disabled || editing !== null} onClick={() => void view.removeQuestion(question.id)}>Удалить</Button>
      </Stack>
      {question.files.map(file => <HomeworkAttachment key={file.publicId} schoolPublicId={view.schoolPublicId} homeworkPublicId={homeworkPublicId} questionId={question.id} file={file} onRemove={disabled ? undefined : () => void view.removeQuestionImage(question.id, file.publicId)} />)}
      <Button component="label" disabled={disabled || question.files.length >= 10} sx={{ alignSelf: 'flex-start' }}>Добавить изображение<input hidden type="file" accept="image/*" onChange={event => {
        const file = event.target.files?.[0];
        if (file) {
          void view.uploadQuestionImage(question.id, file, nextHomeworkPosition(question.files));
        }
        event.target.value = '';
      }} /></Button>
    </Stack></Paper>)}
    {editing !== null ? <HomeworkQuestionEditor key={editing === 'new' ? 'new' : editing.id} homeworkId={homeworkPublicId} version={definition.version} question={editing === 'new' ? null : editing} position={nextHomeworkPosition(questions)} busy={disabled} onCancel={() => setEditing(null)} onSave={async input => {
      const saved = await view.saveQuestion(editing === 'new' ? null : editing.id, input);
      if (saved) {
        setEditing(null);
      }
      return Boolean(saved);
    }} /> : <Button disabled={disabled} variant="outlined" onClick={() => setEditing('new')}>Добавить вопрос</Button>}
  </Stack>;
}
