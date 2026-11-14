import type { CourseLessonsPanelProps } from './CourseLessonsPanel.type';
import { Box } from '@mui/material';

import CourseLessonRow from '../CourseLessonRow/CourseLessonRow';
import CourseState from '../CourseState/CourseState';
import { listSx } from './CourseLessonsPanel.styles';

export default function CourseLessonsPanel({ lessons, canManage, isSavingProgress, onOpenLesson, onToggleCompleted, onEdit }: CourseLessonsPanelProps) {
  if (!lessons.length) {
    return <CourseState kind="empty" title={canManage ? 'В курсе пока нет уроков' : 'Нет доступных уроков'} description={canManage ? 'Добавьте уроки из материалов школы.' : 'Преподаватель откроет доступ к урокам курса.'} actionLabel={canManage ? 'Добавить уроки' : undefined} onAction={canManage ? onEdit : undefined} />;
  }
  return <Box component="ol" sx={listSx}>
    {lessons.map((lesson, index) => <CourseLessonRow key={lesson.lessonId} lesson={lesson} ordinal={index + 1} canManage={canManage} isSavingProgress={isSavingProgress} onOpen={() => onOpenLesson(lesson.lessonId)} onToggleCompleted={() => onToggleCompleted(lesson)} />)}
  </Box>;
}
