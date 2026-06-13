

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
