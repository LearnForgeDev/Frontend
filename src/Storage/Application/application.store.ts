import { configureStore } from '@reduxjs/toolkit';
import homework from '@/Storage/Homework/homework.slice';
import courses from '@/Storage/Courses/courses.slice';

export function createApplicationStore() {
  return configureStore({ reducer: { homework, courses } });
}
