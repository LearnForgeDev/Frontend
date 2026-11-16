import type { CourseDto, CourseProgressDto } from '@/Endpoints/Courses';
import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { createEvent, createLesson, readJson, uploadFile } from './flows.utils';
import { createCourse, createPublishedCourseHomework } from './courses.utils';

test('COURSE-03 COURSE-06 COURSE-09 COURSE-11: mixed blocks retain order and repeated lessons have independent progress', async ({ actors }, testInfo) => {
  const teacher = await actors('teacher');
  const student = await actors('student');
  const lesson = await createLesson(teacher);
  const file = await uploadFile(teacher);
  const event = await createEvent(teacher);
  const homework = await createPublishedCourseHomework(teacher, student.identity.userPublicId);
  const fields = { description: null, isRequired: true, availableFromUtc: null, availableUntilUtc: null };
  const course = await createCourse(teacher, student.identity.userPublicId, [
    { ...fields, title: 'Прочитайте материал', itemType: 0, filePublicId: file.publicId, position: 0 },
    { ...fields, title: 'Изучите урок', itemType: 2, lessonId: Number(lesson.id), position: 1 },
    { ...fields, title: 'Приходите на занятие', itemType: 1, scheduleEventPublicId: event.id, position: 2 },
    { ...fields, title: 'Повторите урок', itemType: 2, lessonId: Number(lesson.id), position: 3 },
    { ...fields, title: 'Выполните задание', itemType: 3, homeworkId: homework.id, position: 4 },
  ]);
  await student.page.goto(`${SCHOOL_PATH}/courses/${course.publicId}`);
  await expect(student.page.getByTestId('course-program').getByRole('heading')).toHaveText(course.items.map(item => item.title));
  await expect(student.page.getByRole('button', { name: 'Настройки', exact: true })).toHaveCount(0);
  await student.page.screenshot({ path: testInfo.outputPath('course-mixed-path-desktop.png'), fullPage: true });
  await student.page.setViewportSize({ width: 390, height: 844 });
  expect(await student.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await student.page.screenshot({ path: testInfo.outputPath('course-mixed-path-mobile.png'), fullPage: true });
  await student.page.setViewportSize({ width: 1280, height: 720 });
  const firstLesson = course.items.find(item => item.title === 'Изучите урок')!;
  const repeatedLesson = course.items.find(item => item.title === 'Повторите урок')!;
  const firstRow = student.page.getByTestId(`course-item-${firstLesson.publicId}`);
  const repeatedRow = student.page.getByTestId(`course-item-${repeatedLesson.publicId}`);
  const completion = student.page.waitForResponse(response =>
    response.url().endsWith(`/ApiCourses/${SCHOOL_ID}/${course.publicId}/items/${firstLesson.publicId}/progress`) && response.request().method() === 'PUT');
  await firstRow.getByRole('checkbox').click();
  const response = await completion;
  expect(response.ok()).toBe(true);
  const accepted: CourseProgressDto = await response.json();
  expect(accepted.items.find(item => item.itemPublicId === firstLesson.publicId)?.status).toBe(2);
  await expect(firstRow.getByRole('checkbox')).toBeChecked();
  await student.page.reload();
  await expect(firstRow.getByRole('checkbox')).toBeChecked();
  await expect(repeatedRow.getByRole('checkbox')).not.toBeChecked();
  const progress = await readJson<CourseProgressDto>(await student.page.request.get(`/api/ApiCourses/${SCHOOL_ID}/${course.publicId}/progress`));
  expect(progress.items.find(item => item.itemPublicId === firstLesson.publicId)?.status).toBe(2);
  expect(progress.items.find(item => item.itemPublicId === repeatedLesson.publicId)?.status ?? 0).toBe(0);
  await repeatedRow.getByRole('button', { name: 'Открыть', exact: true }).click();
  await expect(student.page).toHaveURL(url => url.searchParams.get('item') === repeatedLesson.publicId);
  await expect(student.page.getByTestId('lesson-editor')).toHaveAttribute('contenteditable', 'false');
  await student.page.getByRole('link', { name: 'К курсу', exact: true }).click();
  const material = course.items.find(item => item.itemType === 0)!;
  await student.page.getByTestId(`course-item-${material.publicId}`).getByRole('button', { name: 'Открыть' }).click();
  await expect(student.page.getByRole('dialog').getByRole('link', { name: 'Скачать файл' })).toBeVisible();
  await student.page.keyboard.press('Escape');
  const assignment = course.items.find(item => item.itemType === 3)!;
  await expect(student.page.getByTestId(`course-item-${assignment.publicId}`).getByRole('checkbox')).toHaveCount(0);
  await student.page.getByTestId(`course-item-${assignment.publicId}`).getByRole('button', { name: 'Открыть' }).click();
  await expect(student.page).toHaveURL(url => url.pathname.endsWith(`/homework/${homework.publicId}`) && url.searchParams.get('item') === assignment.publicId);
  await student.page.getByRole('button', { name: 'Вернуться к курсу', exact: true }).click();
  await expect(student.page).toHaveURL(url => url.pathname.endsWith(`/courses/${course.publicId}`) && url.searchParams.get('item') === assignment.publicId);
  await expect(student.page.getByTestId(`course-item-${assignment.publicId}`)).toBeFocused();
  const call = course.items.find(item => item.itemType === 1)!;
  await student.page.getByTestId(`course-item-${call.publicId}`).getByRole('button', { name: 'Открыть' }).click();
  await expect(student.page).toHaveURL(url => url.searchParams.get('eventId') === event.id);
  await expect(student.page.getByRole('dialog')).toContainText(event.title);
});

test('COURSE-06 COURSE-08 COURSE-13: removing blocks preserves sources and revoked readers lose warmed course data', async ({ actors }) => {
  const teacher = await actors('teacher');
  const student = await actors('student');
  const lesson = await createLesson(teacher);
  const fields = { description: null, isRequired: true, availableFromUtc: null, availableUntilUtc: null };
  const course = await createCourse(teacher, student.identity.userPublicId, [
    { ...fields, title: 'Первый блок', itemType: 2, lessonId: Number(lesson.id), position: 0 },
    { ...fields, title: 'Повторение', itemType: 2, lessonId: Number(lesson.id), position: 1 },
  ]);
  await student.page.goto(`${SCHOOL_PATH}/courses/${course.publicId}`);
  await expect(student.page.getByRole('heading', { name: 'Повторение', exact: true })).toBeVisible();
  await teacher.page.goto(`${SCHOOL_PATH}/courses/${course.publicId}`);
  await teacher.page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await teacher.page.getByRole('button', { name: 'Убрать «Первый блок» из курса', exact: true }).click();
  await teacher.page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(teacher.page.getByRole('dialog')).toHaveCount(0);
  const updated = await readJson<CourseDto>(await teacher.page.request.get(`/api/ApiCourses/${SCHOOL_ID}/${course.publicId}`));
  expect(updated.items.map(item => item.publicId)).toEqual([course.items[1].publicId]);
  expect((await teacher.page.request.get(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`)).ok()).toBe(true);
  expect((await teacher.page.request.put(`/api/ApiCourses/${SCHOOL_ID}/${course.publicId}/access`, {
    data: { allowedUserPublicIds: [teacher.identity.userPublicId], allowedGroupIds: [] },
  })).ok()).toBe(true);
  await student.page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(student.page.getByRole('heading', { name: 'Не удалось открыть курс', exact: true })).toBeVisible();
  await expect(student.page.getByRole('heading', { name: 'Повторение', exact: true })).toHaveCount(0);
  await teacher.page.getByRole('button', { name: 'Удалить', exact: true }).click();
  await teacher.page.getByRole('button', { name: 'Удалить курс', exact: true }).click();
  await expect(teacher.page).toHaveURL(url => url.pathname.replace(/\/$/, '') === `${SCHOOL_PATH}/courses`);
  expect((await teacher.page.request.get(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`)).ok()).toBe(true);
});
