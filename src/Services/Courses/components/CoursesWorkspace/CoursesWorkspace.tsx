import { Alert, Box, Button, InputAdornment, TextField, Typography } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import CourseEditorModal from '../../components/CourseEditorModal/CourseEditorModal';
import CoursesList from '../../components/CoursesList/CoursesList';
import CourseState from '../../components/CourseState/CourseState';
import { useCoursesPage } from '../../hooks/useCoursesPage';
import { styles } from './CoursesWorkspace.styles';

interface CoursesWorkspaceProps {
  schoolPublicId: string;
}

export default function CoursesWorkspace({ schoolPublicId }: CoursesWorkspaceProps) {
  const view = useCoursesPage(schoolPublicId);
  return <Box sx={styles.page}>
    <Box sx={styles.header}>
      <Box sx={styles.titleGroup}>
        <Typography component="h1" variant="h4">Курсы</Typography>
        <Typography sx={styles.muted}>{view.canManage ? 'Уроки, ученики и их прогресс — в одном месте.' : 'Ваша программа обучения.'}</Typography>
      </Box>
      {view.canManage && <Button variant="contained" startIcon={<Add />} onClick={view.openEditor} sx={styles.primaryButton}>Создать курс</Button>}
    </Box>
    {view.query.isPending && <CourseState kind="loading" title="Загружаем курсы" />}
    {view.query.isError && !view.hasData && <CourseState kind="error" title="Курсы сейчас недоступны" description="Проверьте доступ к школе или попробуйте ещё раз." actionLabel="Повторить" onAction={() => void view.query.refetch()} />}
    {view.query.isError && view.hasData && <Alert severity="warning" action={<Button color="inherit" disabled={view.query.isFetching} onClick={() => void view.query.refetch()}>Повторить</Button>}>Не удалось обновить курсы. Показываем сохранённые данные.</Alert>}
    {view.hasData && <>
      {view.hasCourses && <Box sx={styles.toolbar}>
        <TextField size="small" label="Поиск курсов" value={view.search} onChange={event => view.setSearch(event.target.value)} sx={styles.search} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
      </Box>}
      {!view.hasCourses && <CourseState kind="empty" title={view.canManage ? 'Создайте первый курс' : 'Вам пока не назначены курсы'} description={view.canManage ? 'Соберите программу из уроков школы и добавьте учеников.' : 'Здесь появятся курсы, на которые вас добавит преподаватель.'} actionLabel={view.canManage ? 'Создать курс' : undefined} onAction={view.canManage ? view.openEditor : undefined} />}
      {view.hasCourses && !view.courses.length && <CourseState kind="empty" title="Ничего не найдено" description="Попробуйте другое название." actionLabel="Сбросить поиск" onAction={() => view.setSearch('')} />}
      {!!view.courses.length && <CoursesList courses={view.courses} onOpenCourse={view.openCourse} />}
    </>}
    {view.isEditorOpen && view.canManage && <CourseEditorModal key={schoolPublicId} schoolPublicId={schoolPublicId} onClose={view.closeEditor} onSaved={view.onCreated} />}
  </Box>;
}
