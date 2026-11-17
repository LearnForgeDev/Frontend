import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { homeworkDefinition, homeworkAttempt, homeworkQuestion } from '@/Services/Homework/homework.testUtils';
import { homeworkEndpoints } from './homework';

vi.mock('@/Endpoints/factory/factory', async () => {
  const { default: axios } = await import('axios');
  return { createQueryFnWithRefresh: () => axios.create({ baseURL: 'http://localhost' }) };
});

const requests: { method: string; url: URL; text: string; idempotencyKey: string | null }[] = [];
const respond = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  requests.push({ method: request.method, url, text: await request.text(), idempotencyKey: request.headers.get('Idempotency-Key') });
  if (url.pathname.endsWith('/content')) {
    return new HttpResponse('private bytes', { headers: { 'Content-Type': 'image/png' } });
  }
  if (url.pathname.endsWith('/presign')) {
    return HttpResponse.json({ uploadUrl: 'https://storage/upload', storageKey: 'owned-key' });
  }
  if (request.method === 'GET' && url.pathname.endsWith('/attempts')) {
    return HttpResponse.json([homeworkAttempt()]);
  }
  if (url.pathname.includes('/attempts/')) {
    return HttpResponse.json(homeworkAttempt());
  }
  if (request.method === 'GET' && url.pathname === '/api/ApiHomeworks/school') {
    return HttpResponse.json([homeworkDefinition()]);
  }
  if (/\/questions(?:\/\d+)?$/.test(url.pathname) && request.method !== 'DELETE') {
    return HttpResponse.json(homeworkQuestion());
  }
  return HttpResponse.json(homeworkDefinition());
};
const server = setupServer(http.all('http://localhost/api/ApiHomeworks/:school', respond), http.all('http://localhost/api/ApiHomeworks/:school/*', respond));
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  requests.length = 0;
});
afterAll(() => server.close());

describe('Homework HTTP contract', () => {
  it('uses explicit draft selection and preserves version/audience/question transport fields', async () => {
    expect((await homeworkEndpoints.list('school'))[0].publicId).toBe('homework-1');
    await homeworkEndpoints.get('school', 'homework-1', true);
    expect(requests.at(-1)?.url.searchParams.get('draft')).toBe('true');
    await homeworkEndpoints.get('school', 'homework-1');
    const metadata = { title: 'Задание', description: null, passingScore: 1.5, maxAttempts: 3, deadlineUtc: null };
    await homeworkEndpoints.create('school', { ...metadata, allowedUserPublicIds: ['student'], allowedGroupIds: [] });
    await homeworkEndpoints.update('school', 'homework-1', metadata);
    await homeworkEndpoints.access('school', 'homework-1', { allowedUserPublicIds: ['student'], allowedGroupIds: [4] });
    expect(JSON.parse(requests.at(-1)?.text ?? '')).toEqual({ allowedUserPublicIds: ['student'], allowedGroupIds: [4] });
    await homeworkEndpoints.draft('school', 'homework-1');
    await homeworkEndpoints.publish('school', 'homework-1');
    await homeworkEndpoints.cancelQueue('school', 'homework-1');
    const question = { ...homeworkQuestion(), options: [] };
    await homeworkEndpoints.saveQuestion('school', 'homework-1', null, question);
    await homeworkEndpoints.saveQuestion('school', 'homework-1', 11, question);
    expect(JSON.parse(requests.at(-1)?.text ?? '')).toMatchObject({ points: 1, studentHint: 'Проверьте вычисления', teacherHint: 'Обратите внимание на единицы' });
    await homeworkEndpoints.order('school', 'homework-1', [12, 11]);
    expect(JSON.parse(requests.at(-1)?.text ?? '')).toEqual({ questionIds: [12, 11] });
    await homeworkEndpoints.removeQuestion('school', 'homework-1', 11);
    await homeworkEndpoints.remove('school', 'homework-1');
    expect(requests.at(-1)?.method).toBe('DELETE');
  });

  it('sends idempotency, question revisions, tab leases and review submission revisions separately', async () => {
    await homeworkEndpoints.attempts('school', 'homework-1', true);
    expect(requests.at(-1)?.url.searchParams.get('mine')).toBe('true');
    await homeworkEndpoints.start('school', 'homework-1', 'request-key');
    expect(requests.at(-1)?.idempotencyKey).toBe('request-key');
    await homeworkEndpoints.getAttempt('school', 'attempt-1');
    await homeworkEndpoints.saveAnswer('school', 'attempt-1', { questionId: 11, revision: 3, textValue: 'Ответ', tabId: 'tab' });
    expect(JSON.parse(requests.at(-1)?.text ?? '')).toMatchObject({ revision: 3, tabId: 'tab' });
    await homeworkEndpoints.presence('school', 'attempt-1', 'tab');
    await homeworkEndpoints.leave('school', 'attempt-1', 'tab');
    await homeworkEndpoints.forceFinish('school', 'attempt-1');
    await homeworkEndpoints.submit('school', 'attempt-1', 2);
    expect(requests.at(-1)?.url.searchParams.get('submissionNumber')).toBe('2');
    const review = { submissionNumber: 2, revision: 4, returnForRevision: false, reviewComment: 'Приватно', answers: [{ questionId: 11, score: 0.5, teacherComment: 'Поправьте', annotations: [] }] };
    await homeworkEndpoints.review('school', 'attempt-1', review);
    expect(requests.at(-1)?.url.pathname.endsWith('/review-draft')).toBe(true);
    expect(requests.at(-1)?.method).toBe('PUT');
    await homeworkEndpoints.review('school', 'attempt-1', review, true);
    expect(requests.at(-1)?.url.pathname.endsWith('/review')).toBe(true);
    expect(requests.at(-1)?.method).toBe('POST');
  });

  it('keeps answer and question file access on authorized domain paths', async () => {
    expect(await homeworkEndpoints.presign('school', 'attempt-1', 11, 'work.png', 'checksum')).toEqual({ uploadUrl: 'https://storage/upload', storageKey: 'owned-key' });
    await homeworkEndpoints.completeUpload('school', 'attempt-1', { questionId: 11, storageKey: 'owned-key', fileName: 'work.png', sizeBytes: 4, mimeType: 'image/png', tabId: 'tab' });
    expect(JSON.parse(requests.at(-1)?.text ?? '')).toMatchObject({ questionId: 11, tabId: 'tab' });
    await homeworkEndpoints.removeAnswerFile('school', 'attempt-1', 11, 'file-1');
    expect(requests.at(-1)?.url.pathname).toBe('/api/ApiHomeworks/school/attempts/attempt-1/answers/11/files/file-1');
    await homeworkEndpoints.answerFile('school', 'attempt-1', 11, 'file-1');
    expect(requests.at(-1)?.url.pathname.endsWith('/files/file-1/content')).toBe(true);
    await homeworkEndpoints.attachQuestionFile('school', 'homework-1', 11, 'file-1', 0, 'Фото');
    expect(JSON.parse(requests.at(-1)?.text ?? '')).toEqual({ filePublicId: 'file-1', position: 0, altText: 'Фото' });
    await homeworkEndpoints.removeQuestionFile('school', 'homework-1', 11, 'file-1');
    await homeworkEndpoints.questionFile('school', 'homework-1', 11, 'file-1');
    expect(requests.at(-1)?.url.pathname).toBe('/api/ApiHomeworks/school/homework-1/questions/11/files/file-1/content');
  });
});
