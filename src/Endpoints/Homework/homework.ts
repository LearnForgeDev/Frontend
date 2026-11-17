import { createQueryFnWithRefresh } from '@/Endpoints/factory/factory';
import type { HomeworkAccessInput, HomeworkAnswerInput, HomeworkAttemptDto, HomeworkDto, HomeworkMetadataInput, HomeworkQuestion, HomeworkQuestionInput, HomeworkReviewInput, HomeworkUploadInput } from './homework.type';

const client = createQueryFnWithRefresh();
const base = (school: string) => `/api/ApiHomeworks/${encodeURIComponent(school)}`;
const homework = (school: string, id: string) => `${base(school)}/${encodeURIComponent(id)}`;
const attempt = (school: string, id: string) => `${base(school)}/attempts/${encodeURIComponent(id)}`;

export const homeworkEndpoints = {
  async list(school: string) {
    return (await client.get<HomeworkDto[]>(base(school))).data;
  },
  async get(school: string, id: string, draft = false) {
    return (await client.get<HomeworkDto>(homework(school, id), { params: draft ? { draft: true } : {} })).data;
  },
  async create(school: string, input: HomeworkMetadataInput & HomeworkAccessInput) {
    return (await client.post<HomeworkDto>(base(school), input)).data;
  },
  async update(school: string, id: string, input: HomeworkMetadataInput) {
    return (await client.put<HomeworkDto>(homework(school, id), input)).data;
  },
  async remove(school: string, id: string) {
    await client.delete(homework(school, id));
  },
  async access(school: string, id: string, input: HomeworkAccessInput) {
    await client.put(`${homework(school, id)}/access`, input);
  },
  async draft(school: string, id: string) {
    return (await client.post<HomeworkDto>(`${homework(school, id)}/draft`)).data;
  },
  async publish(school: string, id: string) {
    return (await client.post<HomeworkDto>(`${homework(school, id)}/publish`)).data;
  },
  async cancelQueue(school: string, id: string) {
    return (await client.delete<HomeworkDto>(`${homework(school, id)}/publication-queue`)).data;
  },
  async saveQuestion(school: string, id: string, questionId: number | null, input: HomeworkQuestionInput) {
    const path = `${homework(school, id)}/questions`;
    return questionId === null
      ? (await client.post<HomeworkQuestion>(path, input)).data
      : (await client.put<HomeworkQuestion>(`${path}/${questionId}`, input)).data;
  },
  async removeQuestion(school: string, id: string, questionId: number) {
    await client.delete(`${homework(school, id)}/questions/${questionId}`);
  },
  async order(school: string, id: string, questionIds: number[]) {
    return (await client.put<HomeworkDto>(`${homework(school, id)}/questions/order`, { questionIds })).data;
  },
  async attempts(school: string, id: string, mine = false) {
    return (await client.get<HomeworkAttemptDto[]>(`${homework(school, id)}/attempts`, { params: { mine } })).data;
  },
  async start(school: string, id: string, key: string) {
    return (await client.post<HomeworkAttemptDto>(`${homework(school, id)}/attempts`, undefined, { headers: { 'Idempotency-Key': key } })).data;
  },
  async getAttempt(school: string, id: string) {
    return (await client.get<HomeworkAttemptDto>(attempt(school, id))).data;
  },
  async saveAnswer(school: string, id: string, input: HomeworkAnswerInput) {
    return (await client.put<HomeworkAttemptDto>(`${attempt(school, id)}/answers`, input)).data;
  },
  async presence(school: string, id: string, tabId: string) {
    return (await client.put<HomeworkAttemptDto>(`${attempt(school, id)}/presence`, { tabId })).data;
  },
  async leave(school: string, id: string, tabId: string) {
    return (await client.delete<HomeworkAttemptDto>(`${attempt(school, id)}/presence/${encodeURIComponent(tabId)}`)).data;
  },
  async forceFinish(school: string, id: string) {
    return (await client.post<HomeworkAttemptDto>(`${attempt(school, id)}/force-finish`)).data;
  },
  async submit(school: string, id: string, submissionNumber: number) {
    return (await client.post<HomeworkAttemptDto>(`${attempt(school, id)}/submit`, undefined, { params: { submissionNumber } })).data;
  },
  async review(school: string, id: string, input: HomeworkReviewInput, finish = false) {
    const path = `${attempt(school, id)}/${finish ? 'review' : 'review-draft'}`;
    return (await client[finish ? 'post' : 'put']<HomeworkAttemptDto>(path, input)).data;
  },
  async presign(school: string, id: string, questionId: number, fileName: string, contentMd5: string) {
    return (await client.post<{ uploadUrl: string; storageKey: string }>(`${attempt(school, id)}/answer-files/presign`, { questionId, fileName, contentMd5 })).data;
  },
  async completeUpload(school: string, id: string, input: HomeworkUploadInput) {
    return (await client.post<HomeworkAttemptDto>(`${attempt(school, id)}/answer-files/complete`, input)).data;
  },
  async removeAnswerFile(school: string, id: string, questionId: number, fileId: string) {
    await client.delete(`${attempt(school, id)}/answers/${questionId}/files/${encodeURIComponent(fileId)}`);
  },
  async answerFile(school: string, id: string, questionId: number, fileId: string, signal?: AbortSignal) {
    return (await client.get<Blob>(`${attempt(school, id)}/answers/${questionId}/files/${encodeURIComponent(fileId)}/content`, { responseType: 'blob', signal })).data;
  },
  async attachQuestionFile(school: string, id: string, questionId: number, filePublicId: string, position: number, altText: string) {
    await client.post(`${homework(school, id)}/questions/${questionId}/files`, { filePublicId, position, altText });
  },
  async removeQuestionFile(school: string, id: string, questionId: number, fileId: string) {
    await client.delete(`${homework(school, id)}/questions/${questionId}/files/${encodeURIComponent(fileId)}`);
  },
  async questionFile(school: string, id: string, questionId: number, fileId: string, signal?: AbortSignal) {
    return (await client.get<Blob>(`${homework(school, id)}/questions/${questionId}/files/${encodeURIComponent(fileId)}/content`, { responseType: 'blob', signal })).data;
  },
};
