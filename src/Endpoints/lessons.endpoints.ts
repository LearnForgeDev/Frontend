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
  getLessons: (
    schoolPublicId: string,
    params?: {
      folderId?: string | null;
      search?: string;
      sort?: string;
      order?: 'asc' | 'desc';
    }
  ): Promise<Lesson[]> =>
    client.get<Lesson[]>('/api/lessons', { params, headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * GET /api/lessons/:id
   * Fetches a specific lesson by its ID.
   */
  getLessonById: (schoolPublicId: string, id: string): Promise<Lesson> =>
    client.get<Lesson>(`/api/lessons/${id}`, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * POST /api/lessons
   * Creates a new lesson with title and folder configuration.
   */
  createLesson: (
    schoolPublicId: string,
    body: {
      title: string;
      folderId: string | null;
    }
  ): Promise<Lesson> =>
    client.post<Lesson>('/api/lessons', body, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * PATCH /api/lessons/:id
   * Updates properties of an existing lesson.
   */
  updateLesson: (
    schoolPublicId: string,
    id: string,
    body: Partial<{ title: string; folderId: string | null; status: string }>
  ): Promise<Lesson> =>
    client.patch<Lesson>(`/api/lessons/${id}`, body, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * DELETE /api/lessons/:id
   * Deletes a specific lesson by ID.
   */
  deleteLesson: (schoolPublicId: string, id: string): Promise<void> =>
    client.delete<void>(`/api/lessons/${id}`, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * GET /api/lessons/folders
   * Fetches folders optionally filtered by parentId.
   */
  getFolders: (
    schoolPublicId: string,
    params?: {
      parentId?: string | null;
    }
  ): Promise<LessonFolder[]> =>
    client.get<LessonFolder[]>('/api/lessons/folders', { params, headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * POST /api/lessons/folders
   * Creates a new lesson folder.
   */
  createFolder: (
    schoolPublicId: string,
    body: {
      name: string;
      parentId: string | null;
      color?: string;
    }
  ): Promise<LessonFolder> =>
    client.post<LessonFolder>('/api/lessons/folders', body, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * PATCH /api/lessons/folders/:id
   * Updates properties of a folder.
   */
  updateFolder: (
    schoolPublicId: string,
    id: string,
    body: Partial<{ name: string; parentId: string | null; color: string }>
  ): Promise<LessonFolder> =>
    client.patch<LessonFolder>(`/api/lessons/folders/${id}`, body, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * DELETE /api/lessons/folders/:id
   * Deletes a folder by ID.
   */
  deleteFolder: (schoolPublicId: string, id: string): Promise<void> =>
    client.delete<void>(`/api/lessons/folders/${id}`, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * POST /api/lessons/:id/editor-state
   * Saves the editor state as JSON.
   */
  sendEditorStateAsJson: (
    schoolPublicId: string,
    id: string | number,
    serializedEditor: unknown
  ): Promise<void> =>
    client.post(`/api/lessons/${id}/editor-state`, serializedEditor, { headers: { schoolPublicId } }),

  /**
   * GET /api/lessons/:id
   * Fetches the lesson object with serializedEditorState.
   */
  getEditorStateAsJson: (
    schoolPublicId: string,
    id: string | number
  ): Promise<lessonObject> =>
    client.get<lessonObject>(`/api/lessons/${id}`, { headers: { schoolPublicId } }).then((res) => res.data),
};
