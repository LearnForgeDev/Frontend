import { describe, test, expect } from 'vitest';
import { getBreadcrumbPath } from '../utils';
import { formatRelativeTime } from '../../LessonCard/utils';
import type { LessonFolder } from '../FileManager.types';

describe('FileManager getBreadcrumbPath utility', () => {
  const folders: LessonFolder[] = [
    { id: 'f1', name: 'Root Folder', parentId: null },
    { id: 'f2', name: 'Sub Folder', parentId: 'f1' },
    { id: 'f3', name: 'Leaf Folder', parentId: 'f2' },
  ];

  test('returns empty array when currentId is null', () => {
    expect(getBreadcrumbPath(folders, null)).toEqual([]);
  });

  test('returns full path for nested leaf folders', () => {
    const path = getBreadcrumbPath(folders, 'f3');
    expect(path.map((folder) => folder.id)).toEqual(['f1', 'f2', 'f3']);
    expect(path.map((folder) => folder.name)).toEqual(['Root Folder', 'Sub Folder', 'Leaf Folder']);
  });

  test('prevents infinite loops when cyclic references occur', () => {
    const cyclicFolders: LessonFolder[] = [
      { id: 'ca', name: 'Cycle A', parentId: 'cb' },
      { id: 'cb', name: 'Cycle B', parentId: 'ca' },
    ];
    const path = getBreadcrumbPath(cyclicFolders, 'ca');
    expect(path.length).toBeLessThanOrEqual(2); // Ends calculation loop instead of hanging
  });
});

describe('LessonCard formatRelativeTime utility', () => {
  test('formats recent date relative times', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  test('formats historical relative times', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeTime(yesterday.toISOString())).toBe('yesterday');

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe('2 days ago');
  });
});
