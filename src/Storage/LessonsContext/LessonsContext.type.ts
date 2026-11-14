

export interface LessonsContextValue {
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
  selectedItemType: 'folder' | 'lesson' | null;
  setSelectedItemType: (type: 'folder' | 'lesson' | null) => void;
  folderId: string | null;
  setFolderId: (id: string | null) => void;
}
