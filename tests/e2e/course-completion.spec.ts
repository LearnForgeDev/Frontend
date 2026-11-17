import type { CourseDto, CourseProgressDto } from '@/Endpoints/Courses';
import type { HomeworkAttemptDto } from '@/Endpoints/Homework/homework.type';
import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { readJson, uploadFile } from './flows.utils';
import { createCourse, createPublishedCourseHomework } from './courses.utils';

const COURSE_API = `/api/ApiCourses/${SCHOOL_ID}`;
const BLOCK_FIELDS = { description: null, isRequired: true, availableFromUtc: null, availableUntilUtc: null, requiredSeconds: null, completeAfterUtc: null };

test('courses: teacher decides whether edited steps keep or reset earned completion', async ({ actors }) => {
  const teacher = await actors('teacher');
  const student = await actors('student');
  const file = await uploadFile(teacher);
  const course = await createCourse(teacher, student.identity.userPublicId, [
    { ...BLOCK_FIELDS, title: 'Материал до изменения', itemType: 0, filePublicId: file.publicId, position: 0, completionRule: 1 },
  ]);
  const progressPath = `${COURSE_API}/${course.publicId}/progress`;
  const itemPath = `${COURSE_API}/${course.publicId}/items/${course.items[0].publicId}`;
  expect((await student.page.request.get(`${itemPath}/file`)).ok()).toBe(true);
  expect((await readJson<CourseProgressDto>(await student.page.request.get(progressPath))).percent).toBe(100);
  await teacher.page.goto(`${SCHOOL_PATH}/courses/${course.publicId}`);
  await teacher.page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await teacher.page.getByRole('textbox', { name: 'Название блока', exact: true }).fill('Материал после уточнения');
  await teacher.page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await teacher.page.getByRole('button', { name: 'Продолжить редактирование', exact: true }).click();
  await expect(teacher.page.getByRole('textbox', { name: 'Название блока', exact: true })).toHaveValue('Материал после уточнения');
  expect((await readJson<CourseProgressDto>(await student.page.request.get(progressPath))).percent).toBe(100);
  await teacher.page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await teacher.page.getByRole('button', { name: 'Сохранить прохождение', exact: true }).click();
  await expect(teacher.page.getByRole('dialog')).toHaveCount(0);
  expect((await readJson<CourseProgressDto>(await student.page.request.get(progressPath))).percent).toBe(100);
  await teacher.page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await teacher.page.getByRole('textbox', { name: 'Название блока', exact: true }).fill('Материал для повторного изучения');
  await teacher.page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await teacher.page.getByRole('button', { name: 'Сбросить прохождение', exact: true }).click();
  await expect(teacher.page.getByRole('dialog')).toHaveCount(0);
  const updated = await readJson<CourseDto>(await teacher.page.request.get(`${COURSE_API}/${course.publicId}`));
  expect(updated.items[0].title).toBe('Материал для повторного изучения');
  expect((await readJson<CourseProgressDto>(await student.page.request.get(progressPath))).percent).toBe(0);
});

test('courses: submitted homework unlocks the next step while approval waits for a passing review', async ({ actors }) => {
  test.setTimeout(90000);
  const teacher = await actors('teacher');
  const student = await actors('student');
  const homework = await createPublishedCourseHomework(teacher, student.identity.userPublicId);
  const course = await createCourse(teacher, student.identity.userPublicId, [
    { ...BLOCK_FIELDS, title: 'Сдайте работу', itemType: 3, homeworkId: homework.id, position: 0, completionRule: 3 },
    { ...BLOCK_FIELDS, title: 'Получите одобрение', itemType: 3, homeworkId: homework.id, position: 1, completionRule: 4 },
  ]);
  const progressPath = `${COURSE_API}/${course.publicId}/progress`;
  await student.page.goto(`${SCHOOL_PATH}/courses/${course.publicId}`);
  await student.page.getByTestId(`course-item-${course.items[0].publicId}`).getByRole('button', { name: 'Открыть', exact: true }).click();
  await student.page.getByRole('button', { name: 'Начать выполнение', exact: true }).click();
  await expect(student.page).toHaveURL(/\/attempts\/[0-9a-f-]+/);
  const attemptPath = new URL(student.page.url()).pathname;
  await student.page.getByRole('textbox', { name: 'Ваш ответ', exact: true }).fill('Объяснение изученного материала.');
  await student.page.getByRole('button', { name: 'Сохранить ответы', exact: true }).click();
  await expect(student.page.getByText('Ответы сохранены на сервере.', { exact: true })).toBeVisible();
  await student.page.getByRole('button', { name: 'Сдать работу', exact: true }).click();
  await expect(student.page.getByText(/версия 1 · Проверяется/)).toBeVisible();
  const submitted = await readJson<CourseProgressDto>(await student.page.request.get(progressPath));
  expect(submitted.items.find(item => item.itemPublicId === course.items[0].publicId)?.status).toBe(2);
  expect(submitted.items.find(item => item.itemPublicId === course.items[1].publicId)?.isUnlocked).toBe(true);
  expect(submitted.items.find(item => item.itemPublicId === course.items[1].publicId)?.status).not.toBe(2);
  await teacher.page.goto(`${attemptPath}/review`);
  await teacher.page.getByRole('spinbutton', { name: 'Баллы за вопрос 1', exact: true }).fill('0');
  await teacher.page.getByRole('button', { name: 'Завершить проверку', exact: true }).click();
  await expect(teacher.page.getByText(/версия 1 · Проверено/)).toBeVisible();
  const failed = await readJson<CourseProgressDto>(await student.page.request.get(progressPath));
  expect(failed.items.find(item => item.itemPublicId === course.items[1].publicId)?.status).not.toBe(2);
  await student.page.goto(`${SCHOOL_PATH}/homework/${homework.publicId}`);
  await student.page.getByRole('button', { name: 'Начать выполнение', exact: true }).click();
  await expect(student.page).toHaveURL(/\/attempts\/[0-9a-f-]+/);
  const passingAttemptPath = new URL(student.page.url()).pathname;
  await student.page.getByRole('textbox', { name: 'Ваш ответ', exact: true }).fill('Исправленное объяснение с верным результатом.');
  await student.page.getByRole('button', { name: 'Сохранить ответы', exact: true }).click();
  await expect(student.page.getByText('Ответы сохранены на сервере.', { exact: true })).toBeVisible();
  await student.page.getByRole('button', { name: 'Сдать работу', exact: true }).click();
  await expect(student.page.getByText(/версия 1 · Проверяется/)).toBeVisible();
  await teacher.page.goto(`${passingAttemptPath}/review`);
  await teacher.page.getByRole('spinbutton', { name: 'Баллы за вопрос 1', exact: true }).fill('1');
  await teacher.page.getByRole('button', { name: 'Завершить проверку', exact: true }).click();
  await expect(teacher.page.getByText(/версия 1 · Проверено/)).toBeVisible();
  await student.page.goto(`${SCHOOL_PATH}/courses/${course.publicId}`);
  const approved = await readJson<CourseProgressDto>(await student.page.request.get(progressPath));
  expect(approved.items.find(item => item.itemPublicId === course.items[1].publicId)?.status).toBe(2);
  expect(approved.percent).toBe(100);
  const attemptsPath = `/api/ApiHomeworks/${SCHOOL_ID}/${homework.publicId}/attempts`;
  const beforeDelete = await readJson<HomeworkAttemptDto[]>(await teacher.page.request.get(attemptsPath));
  expect(beforeDelete).toHaveLength(2);
  const deletion = await teacher.page.request.delete(`/api/ApiHomeworks/${SCHOOL_ID}/${homework.publicId}`);
  expect(deletion.status()).toBe(409);
  expect(await deletion.text()).toContain('homework with attempts cannot be deleted');
  const afterDelete = await readJson<HomeworkAttemptDto[]>(await teacher.page.request.get(attemptsPath));
  const histories = [beforeDelete, afterDelete].map(attempts => attempts.map(attempt => ({
    publicId: attempt.publicId, version: attempt.version, submissionNumber: attempt.submissionNumber,
    status: attempt.status, score: attempt.score, passed: attempt.passed, submissions: attempt.submissions,
  })));
  expect(histories[1]).toEqual(histories[0]);
});
