import type { CoursesListProps } from './CoursesList.type';
import { Box } from '@mui/material';

import CourseCard from '../CourseCard/CourseCard';
import { gridSx } from './CoursesList.styles';

export default function CoursesList({ courses, onOpenCourse }: CoursesListProps) {
  return <Box sx={gridSx}>{courses.map(course => <CourseCard key={course.publicId} course={course} onOpen={() => onOpenCourse(course.publicId)} />)}</Box>;
}
