import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import { ArrowBack, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import PillButtonGroup from '@/Assets/Components/PillButtonGroup/PillButtonGroup';
import { Modal } from '@/Assets/Components/Modal/Modal';
import CourseEditorModal from '../../components/CourseEditorModal/CourseEditorModal';
import CourseLessonsPanel from '../../components/CourseLessonsPanel/CourseLessonsPanel';
import CourseStudentsPanel from '../../components/CourseStudentsPanel/CourseStudentsPanel';
import CourseProgressPanel from '../../components/CourseProgressPanel/CourseProgressPanel';
import CourseState from '../../components/CourseState/CourseState';
import { useCoursePage } from '../../hooks/useCoursePage';
import { formatLessonCount, formatStudentCount } from '../../utils/courseFormatting';
import { MANAGER_COURSE_TABS, STUDENT_COURSE_TABS } from './CourseWorkspace.const';
import { styles } from './CourseWorkspace.styles';

interface CourseWorkspaceProps {
  schoolPublicId: string;
  coursePublicId: string;
}

export default function CourseWorkspace({ schoolPublicId, coursePublicId }: CourseWorkspaceProps) {
  const view = useCoursePage(schoolPublicId, coursePublicId);
  const { course } = view;
  return <Box sx={styles.page}>
    <Button startIcon={<ArrowBack />} onClick={view.goBack} sx={styles.backButton}>Все курсы</Button>
    {view.query.isPending && <CourseState kind="loading" title="Загружаем курс" />}
    {view.query.isError && !course && <CourseState kind="error" title="Не удалось открыть курс" description="Проверьте доступ к курсу или попробуйте ещё раз." actionLabel="Повторить" onAction={() => void view.query.refetch()} />}
    {view.query.isError && course && <Alert severity="warning" action={<Button color="inherit" disabled={view.query.isFetching} onClick={() => void view.query.refetch()}>Повторить</Button>}>Не удалось обновить курс. Показываем сохранённые данные.</Alert>}
    {course && <>
      <Box sx={styles.header}>
        <Box sx={styles.titleGroup}>
          <Typography component="h1" variant="h4" sx={styles.title}>{course.title}</Typography>
          {course.description && <Typography sx={styles.description}>{course.description}</Typography>}
          <Box sx={styles.meta}><Chip size="small" variant="outlined" label={formatLessonCount(course.lessonCount)} />{course.canManage && <Chip size="small" variant="outlined" label={formatStudentCount(course.studentCount)} />}</Box>
        </Box>
        {course.canManage && <Box sx={styles.actions}>
          <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => view.setDialog('edit')} sx={styles.button}>Настройки</Button>
          <Button color="error" startIcon={<DeleteOutlined />} onClick={() => view.setDialog('delete')} sx={styles.button}>Удалить</Button>
        </Box>}
      </Box>
      <Box sx={styles.tabs}><PillButtonGroup options={course.canManage ? MANAGER_COURSE_TABS : STUDENT_COURSE_TABS} value={view.tab} onChange={view.setTab} aria-label="Раздел курса" /></Box>
      {view.progress.isError && <Typography role="alert" sx={styles.error}>Прогресс не сохранился. Попробуйте отметить урок ещё раз.</Typography>}
      {view.tab === 'lessons' && <CourseLessonsPanel lessons={course.lessons} canManage={course.canManage} isSavingProgress={view.progress.isPending} onOpenLesson={view.openLesson} onToggleCompleted={view.markLesson} onEdit={() => view.setDialog('edit')} />}
      {view.tab === 'students' && course.canManage && <CourseStudentsPanel students={course.students} onEdit={() => view.setDialog('edit')} />}
      {view.tab === 'progress' && <CourseProgressPanel course={course} />}
      {view.dialog === 'edit' && course.canManage && <CourseEditorModal key={`${schoolPublicId}/${coursePublicId}`} schoolPublicId={schoolPublicId} course={course} onClose={view.closeDialog} onSaved={view.closeDialog} />}
      {view.dialog === 'delete' && course.canManage && <Modal title="Удалить курс?" onClose={view.closeDialog}>
        <Box sx={styles.deleteContent}>
          <Typography>Курс «{course.title}» и прогресс учеников будут удалены. Уроки останутся в школе.</Typography>
          {view.remove.isError && <Typography role="alert" sx={styles.error}>Не удалось удалить курс. Попробуйте ещё раз.</Typography>}
          <Box sx={styles.actions}><Button onClick={view.closeDialog} disabled={view.remove.isPending} sx={styles.button}>Отмена</Button><Button color="error" variant="contained" onClick={() => view.remove.mutate()} disabled={view.remove.isPending} sx={styles.button}>{view.remove.isPending ? 'Удаляем…' : 'Удалить курс'}</Button></Box>
        </Box>
      </Modal>}
    </>}
  </Box>;
}
