import type { CourseWorkspaceProps } from './CourseWorkspace.type';
import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import { ArrowBack, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import PillButtonGroup from '@/Assets/Components/PillButtonGroup/PillButtonGroup';
import { Modal } from '@/Assets/Components/Modal/Modal';
import CourseEditorModal from '../../components/CourseEditorModal/CourseEditorModal';
import CourseProgramPanel from '../CourseProgramPanel/CourseProgramPanel';
import CourseStudentsPanel from '../../components/CourseStudentsPanel/CourseStudentsPanel';
import CourseProgressPanel from '../../components/CourseProgressPanel/CourseProgressPanel';
import CourseState from '../../components/CourseState/CourseState';
import { useCoursePage } from '../../hooks/useCoursePage';
import { formatBlockCount, formatStudentCount } from '../../utils/courseFormatting';
import { MANAGER_COURSE_TABS, STUDENT_COURSE_TABS } from './CourseWorkspace.const';
import { styles } from './CourseWorkspace.styles';

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
          <Box sx={styles.meta}><Chip size="small" variant="outlined" label={formatBlockCount(course.itemCount)} />{course.canManage && course.studentCount !== null && <Chip size="small" variant="outlined" label={formatStudentCount(course.studentCount)} />}</Box>
        </Box>
        {course.canManage && <Box sx={styles.actions}>
          <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => view.setDialog('edit')} sx={styles.button}>Настройки</Button>
          <Button color="error" startIcon={<DeleteOutlined />} onClick={() => view.setDialog('delete')} sx={styles.button}>Удалить</Button>
        </Box>}
      </Box>
      <Box sx={styles.tabs}><PillButtonGroup options={course.canManage ? MANAGER_COURSE_TABS : STUDENT_COURSE_TABS} value={view.tab} onChange={view.setTab} aria-label="Раздел курса" /></Box>
      {view.progress.isError && <Typography role="alert" sx={styles.error}>Прогресс не сохранился. Попробуйте отметить блок ещё раз.</Typography>}
      {view.openError && <Alert severity="error">{view.openError}</Alert>}
      {view.tab === 'lessons' && <CourseProgramPanel items={course.items} focusItemPublicId={view.focusItemPublicId} canManage={course.canManage} isSavingProgress={view.progress.isPending || !view.query.progressQuery.isSuccess} openingItemPublicId={view.openingItemPublicId} onOpen={view.openItem} onToggleCompleted={view.markItem} onEdit={() => view.setDialog('edit')} />}
      {view.tab !== 'lessons' && view.audienceQuery.isPending && <CourseState kind="loading" title="Загружаем прогресс" />}
      {view.audienceQuery.isError && <CourseState kind="error" title="Не удалось загрузить прогресс" actionLabel="Повторить" onAction={() => void view.audienceQuery.refetch()} />}
      {view.tab === 'students' && course.canManage && view.audienceQuery.isSuccess && <CourseStudentsPanel students={course.students} onEdit={() => view.setDialog('edit')} />}
      {view.tab === 'progress' && view.audienceQuery.isSuccess && <CourseProgressPanel course={course} />}
      {view.material && <Modal title={view.material.fileName} onClose={view.closeMaterial}>
        <Box sx={{ width: { xs: '100%', sm: 720 }, maxWidth: '100%', display: 'grid', gap: 2 }}>
          {view.material.mimeType.startsWith('image/') ? <Box component="img" src={view.material.url} alt={view.material.fileName} sx={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }} /> : view.material.mimeType === 'application/pdf' ? <Box component="iframe" title={view.material.fileName} src={view.material.url} sx={{ border: 0, width: '100%', height: '65vh' }} /> : <Typography>Предпросмотр недоступен. Скачайте файл, чтобы открыть его.</Typography>}
          <Button component="a" href={view.material.url} download={view.material.fileName}>Скачать файл</Button>
        </Box>
      </Modal>}
      {view.dialog === 'edit'  && course.canManage && <CourseEditorModal key={`${schoolPublicId}/${coursePublicId}`} schoolPublicId={schoolPublicId} course={course} onClose={view.closeDialog} onSaved={view.closeDialog} />}
      {view.dialog === 'delete' && course.canManage && <Modal title="Удалить курс?" onClose={view.closeDialog}>
        <Box sx={styles.deleteContent}>
          <Typography>Курс «{course.title}» и прогресс учеников будут удалены. Исходные уроки, материалы, занятия и задания останутся в школе.</Typography>
          {view.remove.isError && <Typography role="alert" sx={styles.error}>Не удалось удалить курс. Попробуйте ещё раз.</Typography>}
          <Box sx={styles.actions}><Button onClick={view.closeDialog} disabled={view.remove.isPending} sx={styles.button}>Отмена</Button><Button color="error" variant="contained" onClick={view.deleteCourse} disabled={view.remove.isPending} sx={styles.button}>{view.remove.isPending ? 'Удаляем…' : 'Удалить курс'}</Button></Box>
        </Box>
      </Modal>}
    </>}
  </Box>;
}
