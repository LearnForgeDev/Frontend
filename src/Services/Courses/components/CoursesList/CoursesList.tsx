import { Box } from '@mui/material';
import type { CourseSummary } from '@/Services/Courses/Courses.types';
import CourseCard from '../CourseCard/CourseCard';
import { gridSx } from './CoursesList.styles';

interface CoursesListProps {
  courses: CourseSummary[];
  onOpenCourse: (coursePublicId: string) => void;
}

export default function CoursesList({ courses, onOpenCourse }: CoursesListProps) {
  return <Box sx={gridSx}>{courses.map(course => <CourseCard key={course.publicId} course={course} onOpen={() => onOpenCourse(course.publicId)} />)}</Box>;
}
