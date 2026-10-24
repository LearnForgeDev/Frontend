import { Alert, Box, Button, Skeleton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useLessonsWorkspace } from '../../hooks/useLessonsWorkspace';
import type { LessonsMainPageProps } from '../../LessonsMainPage.types';
import LessonCard from '../LessonCard/LessonCard';
import RenameLessonDialog from '../RenameLessonDialog/RenameLessonDialog';
import { LESSON_LOADING_CARD_COUNT, LESSON_LOADING_CARD_HEIGHT } from './LessonsWorkspace.const';
import { styles } from './LessonsWorkspace.styles';

export default function LessonsWorkspace(props: LessonsMainPageProps) {
  const view = useLessonsWorkspace(props);
  return <Box className="lessons-main-page" sx={styles.root}>
    <Box component="header" sx={styles.header}>
      <Typography variant="h4" component="h1" sx={styles.title}>Мои уроки</Typography>
      {props.canManageLessons && <Button data-testid="lesson-create" variant="contained" startIcon={<AddIcon />} onClick={view.createLesson} disabled={view.isCreating}>Создать урок</Button>}
    </Box>
    <Box component="main" sx={styles.content}>
      {view.isLoading ? <Box sx={styles.grid}>
        {Array.from({ length: LESSON_LOADING_CARD_COUNT }).map((_, index) => <Skeleton key={index} variant="rectangular" height={LESSON_LOADING_CARD_HEIGHT} sx={styles.skeleton} />)}
      </Box> : view.isError ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => view.refetch()}>Повторить</Button>}>
        Не удалось загрузить уроки.
      </Alert> : !view.lessons?.length ? <Typography color="text.secondary">У вас пока нет уроков.</Typography> : <Box sx={styles.grid}>
        {view.lessons.map(lesson => <LessonCard
          key={lesson.id}
          lesson={lesson}
          selected={false}
          onClick={() => view.openLesson(lesson.id, lesson.title)}
          onOpen={() => view.openLesson(lesson.id, lesson.title)}
          onRename={() => view.openRename(lesson.id)}
          onDelete={() => view.deleteLesson(lesson.id)}
          canManage={props.canManageLessons}
        />)}
      </Box>}
    </Box>
    {view.renameLesson && <RenameLessonDialog schoolPublicId={view.schoolPublicId} lesson={view.renameLesson} onClose={view.closeRename} />}
  </Box>;
}
