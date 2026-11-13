export function getSupportedLessonFiles(files: Iterable<File>): File[] {
  const validExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.pdf', '.png', '.jpeg', '.jpg'];
  return Array.from(files).filter(file => {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    return validExtensions.includes(extension);
  });
}
import type { DragEvent } from 'react';

export function preventLessonDrag(event: DragEvent) {
  event.preventDefault();
}
