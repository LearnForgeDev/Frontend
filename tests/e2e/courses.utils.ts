import type { CourseDto, CourseItemInput } from '@/Endpoints/Courses';
import type { HomeworkDto } from '@/Endpoints/Homework/homework.type';
import type { Actor } from './flows.type';
import { SCHOOL_ID } from './core.const';
import { expect } from './fixtures';
import { readJson, uniqueName } from './flows.utils';

export async function createCourse(actor: Actor, studentPublicId: string, items: CourseItemInput[]) {
  const course = await readJson<CourseDto>(await actor.page.request.post(`/api/ApiCourses/${SCHOOL_ID}`, {
    data: { title: uniqueName('Учебный путь'), description: 'Программа из разных блоков', allowedUserPublicIds: [actor.identity.userPublicId, studentPublicId], allowedGroupIds: [] },
  }));
  actor.cleanup.push(async () => {
    const response = await actor.page.request.delete(`/api/ApiCourses/${SCHOOL_ID}/${course.publicId}`);
    expect([200, 204, 404]).toContain(response.status());
  });
  for (const item of items) {
    await readJson(await actor.page.request.post(`/api/ApiCourses/${SCHOOL_ID}/${course.publicId}/items`, { data: item }));
  }
  return readJson<CourseDto>(await actor.page.request.get(`/api/ApiCourses/${SCHOOL_ID}/${course.publicId}`));
}

export async function createPublishedCourseHomework(actor: Actor, studentPublicId: string) {
  const homework = await readJson<HomeworkDto>(await actor.page.request.post(`/api/ApiHomeworks/${SCHOOL_ID}`, {
    data: { title: uniqueName('Домашнее задание курса'), description: 'Проверка знаний', passingScore: 1, maxAttempts: 3, deadlineUtc: null, allowedUserPublicIds: [actor.identity.userPublicId, studentPublicId], allowedGroupIds: [] },
  }));
  await readJson(await actor.page.request.post(`/api/ApiHomeworks/${SCHOOL_ID}/${homework.publicId}/questions`, {
    data: { position: 0, text: 'Что удалось понять?', questionType: 2, isRequired: true, points: 1, validationJson: null, options: [], richText: null, teacherHint: null, studentHint: 'Ответьте своими словами' },
  }));
  return readJson<HomeworkDto>(await actor.page.request.post(`/api/ApiHomeworks/${SCHOOL_ID}/${homework.publicId}/publish`));
}
