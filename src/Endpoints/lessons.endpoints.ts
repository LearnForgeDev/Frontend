import { createApiClient } from '@/Endpoints/factory';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import config from '../config';

const client = createApiClient(config.endpointUrl);

export const lessonsEndpoints = {
  /**
   * GET /api/ApiLessons/{schoolPublicId}/all
   * Fetches lessons for the given school.
   */
  getLessons: (schoolPublicId: string): Promise<Lesson[]> =>
    client.get<Lesson[]>(`/api/ApiLessons/${schoolPublicId}/all`).then((res) => res.data),

  /**
   * GET /api/ApiLessons/{schoolPublicId}/{id}
   * Fetches a specific lesson by its ID.
   */
  getLessonById: (schoolPublicId: string, id: string): Promise<Lesson> =>
    client.get<Lesson>(`/api/ApiLessons/${schoolPublicId}/${id}`).then((res) => res.data),

  /**
   * POST /api/ApiLessons/{schoolPublicId}
   * Creates a new lesson.
   */
  createLesson: (
    schoolPublicId: string,
    body: {
      title: string;
      description: string;
      lessonJsonFilePublicId: string;
      allowedUserPublicIds?: string[];
      allowedGroupIds?: number[];
      filePublicIds?: string[];
    }
  ): Promise<Lesson> =>
    client.post<Lesson>(`/api/ApiLessons/${schoolPublicId}`, body).then((res) => res.data),

  /**
   * DELETE /api/ApiLessons/{schoolPublicId}/{id}
   * Deletes a specific lesson by ID.
   */
  deleteLesson: (schoolPublicId: string, id: string): Promise<void> =>
    client.delete<void>(`/api/ApiLessons/${schoolPublicId}/${id}`).then((res) => res.data),

  /**
   * POST /api/ApiLessons/{schoolPublicId}/{id}/editor-state
   * Saves the editor state as JSON. (assuming this endpoint exists, wait it doesn't exist on backend! We need to use file APIs)
   * We will remove this and handle it via Files API directly.
   */
};
