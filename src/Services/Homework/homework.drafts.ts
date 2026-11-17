import type { HomeworkAnswerInput } from '@/Endpoints/Homework/homework.type';
import { parseRichTextDocument } from '@/Assets/Components/RichTextEditor/RichTextEditor.utils';
import type { StoredAnswerDraft } from './homework.type';

export const answerDraftKey = (scope: string, attemptId: string, version: number, questionId: number) => `homework-answer:${scope}:${attemptId}:${version}:${questionId}`;

export function sameAnswerDraft(left: HomeworkAnswerInput | undefined, right: HomeworkAnswerInput | undefined) {
  return left?.questionId === right?.questionId && left?.revision === right?.revision
    && (left?.textValue ?? null) === (right?.textValue ?? null)
    && JSON.stringify(left?.richText ?? null) === JSON.stringify(right?.richText ?? null)
    && JSON.stringify(left?.selectedOptionIds ?? []) === JSON.stringify(right?.selectedOptionIds ?? []);
}

export function readAnswerDraft(key: string): HomeworkAnswerInput | null {
  try {
    const source = localStorage.getItem(key);
    const envelope: unknown = source ? JSON.parse(source) : null;
    const value = envelope && typeof envelope === 'object' && 'answer' in envelope ? envelope.answer : envelope;
    if (!value || typeof value !== 'object' || !('questionId' in value) || typeof value.questionId !== 'number'
      || !('revision' in value) || typeof value.revision !== 'number') {
      return null;
    }
    const selectedOptionIds = 'selectedOptionIds' in value && Array.isArray(value.selectedOptionIds)
      ? value.selectedOptionIds.filter((id): id is number => typeof id === 'number') : [];
    return {
      questionId: value.questionId,
      revision: value.revision,
      textValue: 'textValue' in value && typeof value.textValue === 'string' ? value.textValue : null,
      richText: 'richText' in value ? parseRichTextDocument(value.richText) : null,
      selectedOptionIds,
    };
  } catch {
    return null;
  }
}

export function persistAnswerDraft(key: string, answer: HomeworkAnswerInput | null) {
  try {
    if (answer) {
      localStorage.setItem(key, JSON.stringify({ answer, updatedAt: Date.now() }));
    } else {
      localStorage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
}

export function listAnswerDrafts(prefix: string): StoredAnswerDraft[] {
  try {
    return Object.keys(localStorage).filter(key => key.startsWith(`${prefix}:`)).flatMap(key => {
      const answer = readAnswerDraft(key);
      const source: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
      const updatedAt = source && typeof source === 'object' && 'updatedAt' in source && typeof source.updatedAt === 'number' ? source.updatedAt : 0;
      return answer ? [{ key, answer, updatedAt }] : [];
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}
