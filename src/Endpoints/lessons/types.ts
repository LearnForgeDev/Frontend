import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import type { ApiFile } from '../files/types';

export interface CreateLessonRequest {
  title: string;
  description?: string | null;
  lessonJsonFilePublicId: string;
  allowedUserPublicIds?: string[] | null;
  allowedGroupIds?: number[] | null;
  filePublicIds?: string[] | null;
}

export function isLessonFile(file: ApiFile): boolean {
  return (file.fileName || '').startsWith('lesson::');
}

export function apiFileToLesson(file: ApiFile): Lesson {
  const parts = (file.fileName || '').split('::');
  
  // lesson::{url-encoded-title}::{lessonId}.lesson
  // status: derive from name (add '::draft' or '::published' as 4th segment)
  const title = parts.length > 1 ? decodeURIComponent(parts[1]) : (file.fileName || '');
  
  let lessonId = file.publicId;
  if (parts.length > 2) {
    lessonId = parts[2].replace('.lesson', '');
  }

  let status = 'draft';
  if (parts.length > 3) {
    status = parts[3].replace('.lesson', '');
  }

  return {
    id: lessonId,
    publicId: lessonId,
    title,
    folderId: null,
    status,
    updatedAt: file.uploadedAt,
    content: null,
  } as Lesson;
}
