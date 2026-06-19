import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';

export interface ApiFile {
  publicId: string;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByUserId?: string;
  storageKey: string;
}

export interface PresignRequestDto {
  fileName: string;
  sizeBytes: number;
}

export interface PresignResponseDto {
  uploadUrl: string;
  storageKey: string;
}

export interface CompleteUploadDto {
  storageKey: string;
  fileName: string;
  sizeBytes: number;
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
