import { createQueryFnWithRefresh } from '../factory/factory';
import type { CourseDetail, CourseInput, CourseStudentOption, CourseSummary } from './types';

const client = createQueryFnWithRefresh();

const schoolPath = (schoolPublicId: string) => `/api/ApiCourses/${encodeURIComponent(schoolPublicId)}`;
const coursePath = (schoolPublicId: string, coursePublicId: string) =>
  `${schoolPath(schoolPublicId)}/${encodeURIComponent(coursePublicId)}`;

export const coursesEndpoints = {
  async getCourses(schoolPublicId: string): Promise<CourseSummary[]> {
    const response = await client.get<CourseSummary[]>(`${schoolPath(schoolPublicId)}/all`);
    return response.data;
  },
  async getCourse(schoolPublicId: string, coursePublicId: string): Promise<CourseDetail> {
    const response = await client.get<CourseDetail>(coursePath(schoolPublicId, coursePublicId));
    return response.data;
  },
  async getStudents(schoolPublicId: string): Promise<CourseStudentOption[]> {
    const response = await client.get<CourseStudentOption[]>(`${schoolPath(schoolPublicId)}/students`);
    return response.data;
  },
  async createCourse(schoolPublicId: string, body: CourseInput): Promise<CourseDetail> {
    const response = await client.post<CourseDetail>(schoolPath(schoolPublicId), body);
    return response.data;
  },
  async updateCourse(schoolPublicId: string, coursePublicId: string, body: CourseInput): Promise<CourseDetail> {
    const response = await client.put<CourseDetail>(coursePath(schoolPublicId, coursePublicId), body);
    return response.data;
  },
  async deleteCourse(schoolPublicId: string, coursePublicId: string): Promise<void> {
    await client.delete(coursePath(schoolPublicId, coursePublicId));
  },
  async setLessonProgress(schoolPublicId: string, coursePublicId: string, lessonId: number, isCompleted: boolean): Promise<CourseDetail> {
    const response = await client.put<CourseDetail>(
      `${coursePath(schoolPublicId, coursePublicId)}/lessons/${lessonId}/progress`,
      { isCompleted },
    );
    return response.data;
  },
};
