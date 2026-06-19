export interface CreateLessonVars {
  title: string;
  description: string;
  lessonJsonFilePublicId: string;
  allowedUserPublicIds?: string[];
  allowedGroupIds?: number[];
  filePublicIds?: string[];
}

export interface DeleteLessonVars {
  id: string;
}
