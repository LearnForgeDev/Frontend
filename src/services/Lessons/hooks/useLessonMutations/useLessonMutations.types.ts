
export interface CreateLessonVars {
  title: string;
  folderId: string | null;
}

export interface UpdateLessonVars {
  id: string;
  title?: string;
  folderId?: string | null;
  status?: string;
  content?: unknown;
}

export interface DeleteLessonVars {
  id: string;
}

export interface CreateFolderVars {
  name: string;
  parentId: string | null;
  color?: string;
}

export interface UpdateFolderVars {
  id: string;
  name?: string;
  parentId?: string | null;
  color?: string;
}

export interface DeleteFolderVars {
  id: string;
}
