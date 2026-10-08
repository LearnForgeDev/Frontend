import { Box } from '@mui/material';
import type { CourseLesson } from '@/Endpoints/courses';
import CourseLessonRow from '../CourseLessonRow/CourseLessonRow';
import CourseState from '../CourseState/CourseState';
import { listSx } from './CourseLessonsPanel.styles';

interface CourseLessonsPanelProps {
  lessons: CourseLesson[];
  canManage: boolean;
  isSavingProgress: boolean;
  onOpenLesson: (lessonId: number) => void;
  onToggleCompleted: (lesson: CourseLesson) => void;
  onEdit: () => void;
}

export default function CourseLessonsPanel({ lessons, canManage, isSavingProgress, onOpenLesson, onToggleCompleted, onEdit }: CourseLessonsPanelProps) {
  if (!lessons.length) return <CourseState kind="empty" title="В курсе пока нет уроков" description={canManage ? 'Добавьте уроки из материалов школы.' : 'Преподаватель скоро добавит программу.'} actionLabel={canManage ? 'Добавить уроки' : undefined} onAction={canManage ? onEdit : undefined} />;
  return <Box component="ol" sx={listSx}>
    {lessons.map((lesson, index) => <CourseLessonRow key={lesson.lessonId} lesson={lesson} ordinal={index + 1} canManage={canManage} isSavingProgress={isSavingProgress} onOpen={() => onOpenLesson(lesson.lessonId)} onToggleCompleted={() => onToggleCompleted(lesson)} />)}
  </Box>;
}
