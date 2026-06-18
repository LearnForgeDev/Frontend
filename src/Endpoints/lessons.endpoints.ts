import { createApiClient } from '@/Endpoints/factory';
import type { Lesson, LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { lessonObject } from '@/Services/Lessons/lessonTypes';
import config from '../config';

const client = createApiClient(config.endpointUrl);

export const lessonsEndpoints = {
  /**
   * GET /lessons
   * Fetches lessons optionally filtered by folderId, search string, sort property, and order.
   */
  getLessons: (params?: {
    folderId?: string | null;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<Lesson[]> =>
    client.get<Lesson[]>('/lessons', { params }).then((res) => res.data),

  /**
   * GET /lessons/:id
   * Fetches a specific lesson by its ID.
   */
  getLessonById: (id: string): Promise<Lesson> =>
    client.get<Lesson>(`/lessons/${id}`).then((res) => res.data),

  /**
   * POST /lessons
   * Creates a new lesson with title and folder configuration.
   */
  createLesson: (body: {
    title: string;
    folderId: string | null;
  }): Promise<Lesson> =>
    client.post<Lesson>('/lessons', body).then((res) => res.data),

  /**
   * PATCH /lessons/:id
   * Updates properties of an existing lesson.
   */
  updateLesson: (
    id: string,
    body: Partial<{ title: string; folderId: string | null; status: string }>
  ): Promise<Lesson> =>
    client.patch<Lesson>(`/lessons/${id}`, body).then((res) => res.data),

  /**
   * DELETE /lessons/:id
   * Deletes a specific lesson by ID.
   */
  deleteLesson: (id: string): Promise<void> =>
    client.delete<void>(`/lessons/${id}`).then((res) => res.data),

  /**
   * GET /lessons/folders
   * Fetches folders optionally filtered by parentId.
   */
  getFolders: (params?: {
    parentId?: string | null;
  }): Promise<LessonFolder[]> =>
    client.get<LessonFolder[]>('/lessons/folders', { params }).then((res) => res.data),

  /**
   * POST /lessons/folders
   * Creates a new lesson folder.
   */
  createFolder: (body: {
    name: string;
    parentId: string | null;
    color?: string;
  }): Promise<LessonFolder> =>
    client.post<LessonFolder>('/lessons/folders', body).then((res) => res.data),

  /**
   * PATCH /lessons/folders/:id
   * Updates properties of a folder.
   */
  updateFolder: (
    id: string,
    body: Partial<{ name: string; parentId: string | null; color: string }>
  ): Promise<LessonFolder> =>
    client.patch<LessonFolder>(`/lessons/folders/${id}`, body).then((res) => res.data),

  /**
   * DELETE /lessons/folders/:id
   * Deletes a folder by ID.
   */
  deleteFolder: (id: string): Promise<void> =>
    client.delete<void>(`/lessons/folders/${id}`).then((res) => res.data),

  /**
   * POST /lessons/:id/editor-state
   * Saves the editor state as JSON.
   */
  sendEditorStateAsJson: (
    id: string | number,
    serializedEditor: unknown
  ): Promise<void> =>
    client.post(`/lessons/${id}/editor-state`, serializedEditor),

  /**
   * GET /lessons/:id
   * Fetches the lesson object with serializedEditorState.
   */
  getEditorStateAsJson: (
    id: string | number
  ): Promise<lessonObject> =>
    client.get<lessonObject>(`/lessons/${id}`).then((res) => res.data),
};
