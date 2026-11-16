export function getCoursesPath(schoolPublicId: string) {
  return `/app/schools/${encodeURIComponent(schoolPublicId)}/courses`;
}

export function getCoursePath(schoolPublicId: string, coursePublicId: string) {
  return `${getCoursesPath(schoolPublicId)}/${encodeURIComponent(coursePublicId)}`;
}

export function getCourseLessonPath(schoolPublicId: string, coursePublicId: string, lessonId: number, itemPublicId?: string) {
  return `${getCoursePath(schoolPublicId, coursePublicId)}/lessons/${lessonId}${itemPublicId ? `?item=${encodeURIComponent(itemPublicId)}` : ''}`;
}
