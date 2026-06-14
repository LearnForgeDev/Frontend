import type { LessonFolder } from './FileManager.types';

/**
 * Derives the ancestor chain from a list of folders to compile breadcrumbs.
 * Avoids infinite loops in cyclic folder hierarchies by utilizing a visited Set.
 */
export function getBreadcrumbPath(folders: LessonFolder[], currentId: string | null): LessonFolder[] {
  if (!currentId) return [];

  const path: LessonFolder[] = [];
  const visited = new Set<string>();
  let current = folders.find((f) => f.id === currentId);

  while (current) {
    if (visited.has(current.id)) {
      break; // Safeguard against cyclic relationship
    }
    visited.add(current.id);
    path.unshift(current);

    const parentId = current.parentId;
    current = parentId ? folders.find((f) => f.id === parentId) : undefined;
  }

  return path;
}
