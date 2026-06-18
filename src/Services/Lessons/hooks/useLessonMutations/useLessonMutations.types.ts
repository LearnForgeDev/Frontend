export interface CreateLessonVars {
  title: string;
  folderId: string | null;
}

export interface RenameLessonVars {
  id: string;
  title: string;
}

export interface DeleteLessonVars {
  id: string;
}

export interface CreateFolderVars {
  name: string;
  parentId: string | null;
  color?: string;
}

export interface RenameFolderVars {
  id: string;
  name: string;
}

export interface DeleteFolderVars {
  id: string;
}
