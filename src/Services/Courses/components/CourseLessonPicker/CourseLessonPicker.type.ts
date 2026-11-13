import type { LessonOption } from '../../Courses.type';

export interface CourseLessonPickerProps {
  options: LessonOption[];
  selected: LessonOption[];
  onChange: (lessonIds: number[]) => void;
  onMove: (lessonId: number, direction: -1 | 1) => void;
  disabled: boolean;
}
