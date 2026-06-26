import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { CreateLessonRequest } from './types';

const apiClient = createApiClient({});
const queryFn = createQueryFnWithRefresh();

export const lessonsEndpoints = {
  async getLessons(schoolPublicId: string): Promise<Lesson[]> {
    const queryKey = [`/api/ApiLessons/${schoolPublicId}/all`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<Lesson[]>(queryKey[0]),
    });
    return response.data;
  },

  async getLessonById(schoolPublicId: string, lessonId: string): Promise<Lesson> {
    const queryKey = [`/api/ApiLessons/${schoolPublicId}/${lessonId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<Lesson>(queryKey[0]),
    });
    return response.data;
  },

  async createLesson(schoolPublicId: string, body: CreateLessonRequest): Promise<Lesson> {
    const queryKey = [`/api/ApiLessons/${schoolPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, body],
      queryFn: () => queryFn.post<Lesson>(queryKey[0], body),
    });
    return response.data;
  },

  async deleteLesson(schoolPublicId: string, lessonId: string): Promise<void> {
    const queryKey = [`/api/ApiLessons/${schoolPublicId}/${lessonId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.delete<void>(queryKey[0]),
    });
    return response.data;
  },
};
