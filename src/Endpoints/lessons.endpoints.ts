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
    client.get<Lesson[]>('/lessons', { params, headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * GET /lessons/:id
   * Fetches a specific lesson by its ID.
   */
  getLessonById: (schoolPublicId: string, id: string): Promise<Lesson> =>
    client.get<Lesson>(`/lessons/${id}`, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * POST /lessons
   * Creates a new lesson with title and folder configuration.
   */
  createLesson: (
    schoolPublicId: string,
    body: {
      title: string;
      folderId: string | null;
    }
  ): Promise<Lesson> =>
    client.post<Lesson>('/lessons', body, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * PATCH /lessons/:id
   * Updates properties of an existing lesson.
   */
  updateLesson: (
    schoolPublicId: string,
    id: string,
    body: Partial<{ title: string; folderId: string | null; status: string }>
  ): Promise<Lesson> =>
    client.patch<Lesson>(`/lessons/${id}`, body, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * DELETE /lessons/:id
   * Deletes a specific lesson by ID.
   */
  deleteLesson: (schoolPublicId: string, id: string): Promise<void> =>
    client.delete<void>(`/lessons/${id}`, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * GET /lessons/folders
   * Fetches folders optionally filtered by parentId.
   */
  getFolders: (
    schoolPublicId: string,
    params?: {
      parentId?: string | null;
    }
  ): Promise<LessonFolder[]> =>
    client.get<LessonFolder[]>('/lessons/folders', { params, headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * POST /lessons/folders
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
    client.post<LessonFolder>('/lessons/folders', body, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * PATCH /lessons/folders/:id
   * Updates properties of a folder.
   */
  updateFolder: (
    schoolPublicId: string,
    id: string,
    body: Partial<{ name: string; parentId: string | null; color: string }>
  ): Promise<LessonFolder> =>
    client.patch<LessonFolder>(`/lessons/folders/${id}`, body, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * DELETE /lessons/folders/:id
   * Deletes a folder by ID.
   */
  deleteFolder: (schoolPublicId: string, id: string): Promise<void> =>
    client.delete<void>(`/lessons/folders/${id}`, { headers: { schoolPublicId } }).then((res) => res.data),

  /**
   * POST /lessons/:id/editor-state
   * Saves the editor state as JSON.
   */
  sendEditorStateAsJson: (
    schoolPublicId: string,
    id: string | number,
    serializedEditor: unknown
  ): Promise<void> =>
    client.post(`/lessons/${id}/editor-state`, serializedEditor, { headers: { schoolPublicId } }),

  /**
   * GET /lessons/:id
   * Fetches the lesson object with serializedEditorState.
   */
  getEditorStateAsJson: (
    schoolPublicId: string,
    id: string | number
  ): Promise<lessonObject> =>
    client.get<lessonObject>(`/lessons/${id}`, { headers: { schoolPublicId } }).then((res) => res.data),
};
