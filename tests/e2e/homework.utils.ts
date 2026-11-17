import type { Page } from '@playwright/test';
import type { HomeworkDto, HomeworkQuestionInput } from '../../src/Endpoints/Homework/homework.type';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { readJson, uniqueName } from './flows.utils';

export const HOMEWORK_API = `/api/ApiHomeworks/${SCHOOL_ID}`;

export function homeworkPath(id: string) {
  return `${SCHOOL_PATH}/homework/${id}`;
}

export async function createHomework(page: Page, students: string[], allTypes = true) {
  const draft = await readJson<HomeworkDto>(await page.request.post(HOMEWORK_API, {
    data: { title: uniqueName('Практика с обратной связью'), description: 'Проверка домашнего задания', passingScore: 0, maxAttempts: 3, allowedUserPublicIds: students, allowedGroupIds: [] },
  }));
  const types = allTypes ? [2, 3, 1, 0, 4] : [2];
  for (const [position, questionType] of types.entries()) {
    const input: HomeworkQuestionInput = {
      position,
      text: ['Короткое объяснение', 'Подробное решение', 'Выберите результат', 'Выберите свойства', 'Решение от руки'][position],
      questionType: questionType === 0 || questionType === 1 || questionType === 3 || questionType === 4 ? questionType : 2,
      isRequired: true,
      points: questionType === 4 ? 2 : 1,
      richText: null,
      studentHint: position === 0 ? 'Начните с определения.' : null,
      teacherHint: position === 0 ? 'Приватная заметка преподавателю.' : null,
      validationJson: null,
      options: questionType < 2 ? [
        { position: 0, text: 'Первый верный', value: null, isCorrect: true },
        { position: 1, text: questionType === 0 ? 'Второй верный' : 'Неверный', value: null, isCorrect: questionType === 0 },
      ] : [],
    };
    await readJson(await page.request.post(`${HOMEWORK_API}/${draft.publicId}/questions`, { data: input }));
  }
  await readJson(await page.request.put(`${HOMEWORK_API}/${draft.publicId}`, {
    data: { title: draft.title, description: draft.description, passingScore: allTypes ? 5 : 1, maxAttempts: 3, deadlineUtc: null },
  }));
  return readJson<HomeworkDto>(await page.request.post(`${HOMEWORK_API}/${draft.publicId}/publish`));
}

export async function handwrittenFixture(page: Page) {
  const data = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 600;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas is unavailable');
    }
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 900, 600);
    context.fillStyle = '#173969';
    context.font = '48px cursive';
    context.fillText('2 + 2 = 5', 120, 180);
    context.fillText('Ответ: 5', 120, 290);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  return { name: 'решение.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64') };
}
