import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';

export interface LessonsContextValue {
  folderId: string | null;
  setFolderId: (id: string | null) => void;
  search: string;
  setSearch: (search: string) => void;
  sort: string;
  setSort: (sort: string) => void;
  order: 'asc' | 'desc';
  setOrder: (order: 'asc' | 'desc') => void;
  view: 'grid' | 'list';
  setView: (view: 'grid' | 'list') => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  selectedItemType: 'lesson' | 'folder' | null;
  setSelectedItemType: (type: 'lesson' | 'folder' | null) => void;
  allFolders: LessonFolder[];
  createFolder: (vars: { name: string; parentId: string | null; color?: string }) => LessonFolder;
  deleteFolder: (id: string) => void;
}

const LessonsContext = createContext<LessonsContextValue | undefined>(undefined);

export function LessonsProvider({ children }: { children: ReactNode }) {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('title');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'lesson' | 'folder' | null>(null);

  // TODO: replace local folder state with POST/DELETE /api/ApiBreanches
  // once the backend implements folder-specific branch endpoints.
  const [allFolders, setAllFolders] = useState<LessonFolder[]>(() => {
    const saved = localStorage.getItem('localFolders');
    return saved ? JSON.parse(saved) : [];
  });

  const createFolder = (vars: { name: string; parentId: string | null; color?: string }) => {
    const newFolder: LessonFolder = {
      id: crypto.randomUUID(),
      name: vars.name,
      parentId: vars.parentId,
      color: vars.color,
    } as LessonFolder;
    setAllFolders((prev) => {
      const updated = [...prev, newFolder];
      localStorage.setItem('localFolders', JSON.stringify(updated));
      return updated;
    });
    return newFolder;
  };

  const deleteFolder = (id: string) => {
    setAllFolders((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem('localFolders', JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo<LessonsContextValue>(
    () => ({
      folderId,
      setFolderId,
      search,
      setSearch,
      sort,
      setSort,
      order,
      setOrder,
      view,
      setView,
      selectedItemId,
      setSelectedItemId,
      selectedItemType,
      setSelectedItemType,
      allFolders,
      createFolder,
      deleteFolder,
    }),
    [folderId, search, sort, order, view, selectedItemId, selectedItemType, allFolders]
  );

  return <LessonsContext.Provider value={value}>{children}</LessonsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLessonsContext(): LessonsContextValue {
  const context = useContext(LessonsContext);
  if (!context) {
    throw new Error('useLessonsContext must be used within a LessonsProvider');
  }
  return context;
}
