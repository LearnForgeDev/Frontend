import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useCurrentSchool } from '@/Services/AppShell/hooks/useCurrentSchool';
import { useHomework } from './hooks/useHomework';
import { PUBLICATION_LABELS } from './homework.const';

export default function HomeworkPage() {
  const view = useHomework();
  const { capabilities } = useCurrentSchool();
  const navigate = useNavigate();
  return <Stack spacing={3} sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 } }}>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ flex: 1 }}><Typography variant="h4">Домашние задания</Typography><Typography color="text.secondary">Практика, ответы и обратная связь в одном месте.</Typography></Box>
      {capabilities.canTeach && <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('new')}>Создать задание</Button>}
    </Stack>
    {view.error && <Alert severity="error" action={<Button onClick={() => void view.refresh()}>Повторить</Button>}>{view.error}</Alert>}
    {(view.status === 'idle' || view.status === 'loading') && !view.homeworks.length && <CircularProgress aria-label="Загрузка домашних заданий" />}
    {view.status === 'ready' && !view.homeworks.length && <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
      <AssignmentOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} /><Typography variant="h6">Здесь появятся домашние задания</Typography>
      <Typography color="text.secondary">{capabilities.canTeach ? 'Создайте вопросы, задайте баллы и выберите учеников.' : 'Преподаватель добавит задания для вашей практики.'}</Typography>
    </Paper>}
    {view.homeworks.map(homework => <Paper key={homework.publicId} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={1.5}><Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}><Typography variant="h6" sx={{ flex: 1 }}>{homework.title}</Typography>
        {homework.canManage && <Chip size="small" label={PUBLICATION_LABELS[homework.publicationState]} />}</Stack>
        {homework.description && <Typography color="text.secondary">{homework.description}</Typography>}
        <Typography variant="body2" color="text.secondary">Вопросов: {homework.questions.length} · Баллов: {homework.questions.reduce((sum, question) => sum + question.points, 0)}</Typography>
        <Box><Button onClick={() => navigate(homework.publicId)}>Открыть</Button></Box>
      </Stack>
    </Paper>)}
  </Stack>;
}
