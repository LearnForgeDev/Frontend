import { randomUUID } from 'node:crypto';
import type { CourseDto, CourseProgressDto } from '@/Endpoints/Courses';
import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { createEvent, createLesson, readJson, uploadFile } from './flows.utils';
import { createCourse, createPublishedCourseHomework } from './courses.utils';

const COURSE_API = `/api/ApiCourses/${SCHOOL_ID}`;
const BLOCK_FIELDS = { description: null, isRequired: true, availableFromUtc: null, availableUntilUtc: null, requiredSeconds: null, completeAfterUtc: null };

test('COURSE-03 COURSE-06 COURSE-09 COURSE-11: mixed steps unlock in order and timed progress survives reloads', async ({ actors }, testInfo) => {
  test.setTimeout(120000);
  const teacher = await actors('teacher');
  const student = await actors('student');
  const lesson = await createLesson(teacher);
  const file = await uploadFile(teacher);
  const event = await createEvent(teacher);
  const homework = await createPublishedCourseHomework(teacher, student.identity.userPublicId);
  const course = await createCourse(teacher, student.identity.userPublicId, [
    { ...BLOCK_FIELDS, title: 'Прочитайте материал', itemType: 0, filePublicId: file.publicId, position: 0, completionRule: 1 },
    { ...BLOCK_FIELDS, title: 'Изучите урок', itemType: 2, lessonId: Number(lesson.id), position: 1, completionRule: 2, requiredSeconds: 6 },
    { ...BLOCK_FIELDS, title: 'Повторите урок', itemType: 2, lessonId: Number(lesson.id), position: 2, completionRule: 0, isRequired: false },
    { ...BLOCK_FIELDS, title: 'Приходите на занятие', itemType: 1, scheduleEventPublicId: event.id, position: 3, completionRule: 7 },
    { ...BLOCK_FIELDS, title: 'Выполните задание', itemType: 3, homeworkId: homework.id, position: 4, completionRule: 3 },
  ]);
  const [material, firstLesson, repeatedLesson, call, assignment] = course.items;
  const coursePath = `${SCHOOL_PATH}/courses/${course.publicId}`;
  const progressPath = `${COURSE_API}/${course.publicId}/progress`;
  const itemPath = `${COURSE_API}/${course.publicId}/items`;
  await student.page.goto(coursePath);
  await expect(student.page.getByTestId('course-program').getByRole('heading')).toHaveText(course.items.map(item => item.title));
  await expect(student.page.getByRole('button', { name: 'Настройки', exact: true })).toHaveCount(0);
  const firstRow = student.page.getByTestId(`course-item-${firstLesson.publicId}`);
  await expect(firstRow.getByRole('button', { name: 'Открыть', exact: true })).toBeDisabled();
  expect((await student.page.request.post(`${itemPath}/${firstLesson.publicId}/activity`, {
    data: { kind: 0, sessionId: randomUUID(), elapsedSeconds: 0 },
  })).status()).toBe(409);
  expect((await student.page.request.put(`${itemPath}/${firstLesson.publicId}/progress`, { data: { status: 2 } })).status()).toBe(409);
  await student.page.screenshot({ path: testInfo.outputPath('course-mixed-path-desktop.png'), fullPage: true });
  await student.page.setViewportSize({ width: 390, height: 844 });
  expect(await student.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await student.page.screenshot({ path: testInfo.outputPath('course-mixed-path-mobile.png'), fullPage: true });
  await student.page.setViewportSize({ width: 1280, height: 720 });
  await student.page.getByTestId(`course-item-${material.publicId}`).getByRole('button', { name: 'Открыть', exact: true }).click();
  await expect(student.page.getByRole('dialog').getByRole('link', { name: 'Скачать файл' })).toBeVisible();
  await student.page.keyboard.press('Escape');
  await expect(firstRow.getByRole('button', { name: 'Открыть', exact: true })).toBeEnabled();
  await student.page.reload();
  const opened = await readJson<CourseProgressDto>(await student.page.request.get(progressPath));
  expect(opened.items.find(item => item.itemPublicId === material.publicId)?.status).toBe(2);
  await firstRow.getByRole('button', { name: 'Открыть', exact: true }).click();
  await expect(student.page).toHaveURL(url => url.searchParams.get('item') === firstLesson.publicId);
  await expect(student.page.getByTestId('lesson-editor')).toHaveAttribute('contenteditable', 'false');
  await expect.poll(async () => {
    const progress = await readJson<CourseProgressDto>(await student.page.request.get(progressPath));
    return progress.items.find(item => item.itemPublicId === firstLesson.publicId)?.elapsedSeconds ?? 0;
  }, { timeout: 15000 }).toBeGreaterThan(0);
  await student.page.reload();
  await expect(student.page.getByTestId('lesson-editor')).toHaveAttribute('contenteditable', 'false');
  const backgroundTab = await student.context.newPage();
  await backgroundTab.goto('about:blank');
  await expect.poll(async () => {
    const progress = await readJson<CourseProgressDto>(await student.page.request.get(progressPath));
    return progress.items.find(item => item.itemPublicId === firstLesson.publicId)?.status;
  }, { timeout: 20000 }).toBe(2);
  await backgroundTab.close();
  await student.page.getByRole('link', { name: 'К курсу', exact: true }).click();
  const repeatedRow = student.page.getByTestId(`course-item-${repeatedLesson.publicId}`);
  await expect(repeatedRow.getByRole('button', { name: 'Открыть', exact: true })).toBeEnabled();
  await repeatedRow.getByRole('button', { name: 'Открыть', exact: true }).click();
  await expect(student.page).toHaveURL(url => url.searchParams.get('item') === repeatedLesson.publicId);
  await student.page.getByRole('link', { name: 'К курсу', exact: true }).click();
  const progress = await readJson<CourseProgressDto>(await student.page.request.get(progressPath));
  expect(progress.items.find(item => item.itemPublicId === repeatedLesson.publicId)?.status ?? 0).not.toBe(2);
  const homeworkRow = student.page.getByTestId(`course-item-${assignment.publicId}`);
  await expect(homeworkRow.getByRole('button', { name: 'Открыть', exact: true })).toBeDisabled();
  expect((await student.page.request.put(`${itemPath}/${call.publicId}/students/${student.identity.userPublicId}/progress`, { data: { status: 2 } })).status()).toBe(403);
  await teacher.page.goto(coursePath);
  await teacher.page.getByRole('button', { name: 'Прогресс', exact: true }).click();
  await teacher.page.getByRole('button', { name: `Подтвердить «${call.title}» для ${student.identity.userName}`, exact: true }).click();
  await expect(teacher.page.getByRole('button', { name: `Сбросить «${call.title}» для ${student.identity.userName}`, exact: true })).toBeVisible();
  await student.page.reload();
  await student.page.getByTestId(`course-item-${call.publicId}`).getByRole('button', { name: 'Открыть', exact: true }).click();
  await expect(student.page).toHaveURL(url => url.searchParams.get('eventId') === event.id);
  await expect(student.page.getByRole('dialog')).toContainText(event.title);
  await student.page.goto(coursePath);
  await homeworkRow.getByRole('button', { name: 'Открыть', exact: true }).click();
  await expect(student.page).toHaveURL(url => url.pathname.endsWith(`/homework/${homework.publicId}`) && url.searchParams.get('item') === assignment.publicId);
  await student.page.getByRole('button', { name: 'Начать выполнение', exact: true }).click();
  await student.page.getByRole('textbox', { name: 'Ваш ответ', exact: true }).fill('Материал изучен, решение готово.');
  await student.page.getByRole('button', { name: 'Сохранить ответы', exact: true }).click();
  await expect(student.page.getByText('Ответы сохранены на сервере.', { exact: true })).toBeVisible();
  await student.page.getByRole('button', { name: 'Сдать работу', exact: true }).click();
  await expect(student.page.getByText(/версия 1 · Проверяется/)).toBeVisible();
  await student.page.getByRole('button', { name: 'Вернуться к курсу', exact: true }).click();
  await expect(student.page).toHaveURL(url => url.pathname.endsWith(`/courses/${course.publicId}`) && url.searchParams.get('item') === assignment.publicId);
  await expect(homeworkRow).toBeFocused();
  const submitted = await readJson<CourseProgressDto>(await student.page.request.get(progressPath));
  expect(submitted.items.find(item => item.itemPublicId === assignment.publicId)?.status).toBe(2);
  expect(submitted.percent).toBe(100);
});

test('COURSE-06 COURSE-08 COURSE-13: removing blocks preserves sources and revoked readers lose warmed course data', async ({ actors }) => {
  const teacher = await actors('teacher');
  const student = await actors('student');
  const lesson = await createLesson(teacher);
  const course = await createCourse(teacher, student.identity.userPublicId, [
    { ...BLOCK_FIELDS, title: 'Первый блок', itemType: 2, lessonId: Number(lesson.id), position: 0, completionRule: 2, requiredSeconds: 60 },
    { ...BLOCK_FIELDS, title: 'Повторение', itemType: 2, lessonId: Number(lesson.id), position: 1, completionRule: 0, isRequired: false },
  ]);
  await student.page.goto(`${SCHOOL_PATH}/courses/${course.publicId}`);
  await expect(student.page.getByRole('heading', { name: 'Повторение', exact: true })).toBeVisible();
  await teacher.page.goto(`${SCHOOL_PATH}/courses/${course.publicId}`);
  await teacher.page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await teacher.page.getByRole('button', { name: 'Убрать «Первый блок» из курса', exact: true }).click();
  await teacher.page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(teacher.page.getByRole('dialog')).toHaveCount(0);
  const updated = await readJson<CourseDto>(await teacher.page.request.get(`${COURSE_API}/${course.publicId}`));
  expect(updated.items.map(item => item.publicId)).toEqual([course.items[1].publicId]);
  expect((await teacher.page.request.get(`/api/ApiLessons/${SCHOOL_ID}/${lesson.id}`)).ok()).toBe(true);
  expect((await teacher.page.request.put(`${COURSE_API}/${course.publicId}/access`, {
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
