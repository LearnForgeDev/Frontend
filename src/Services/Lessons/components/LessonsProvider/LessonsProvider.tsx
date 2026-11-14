import type { LessonsContextValue } from "@/Storage/LessonsContext/LessonsContext.type";

import { useState, useMemo, type ReactNode } from 'react';

import { LessonsContext } from '@/Services/Lessons/LessonsContext.context';

export function LessonsProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('title');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'folder' | 'lesson' | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);

  const value = useMemo<LessonsContextValue>(
    () => ({
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
      folderId,
      setFolderId,
    }),
    [search, sort, order, view, selectedItemId, selectedItemType, folderId]
  );

  return <LessonsContext.Provider value={value}>{children}</LessonsContext.Provider>;
}
