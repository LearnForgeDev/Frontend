import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

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
    }),
    [folderId, search, sort, order, view, selectedItemId, selectedItemType]
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
