import { describe, expect, it } from 'vitest';
import { isAttemptEditable, remainingSeconds, validateQuestion, validateReview } from './homework.validation';
import { homeworkAttempt, homeworkQuestion } from './homework.testUtils';

describe('Homework question and review rules', () => {
  it('accepts all five question kinds with default one point and valid answer keys', () => {
    for (const questionType of [0, 1, 2, 3, 4]) {
      if (questionType === 0 || questionType === 1 || questionType === 2 || questionType === 3 || questionType === 4) {
        const question = { ...homeworkQuestion({ questionType }), options: questionType < 2 ? [{ text: 'Верно', value: null, position: 0, isCorrect: true }] : [] };
        expect(validateQuestion(question)).toBeNull();
      }
    }
  });

  it('rejects blank prompts, negative/invalid points and incomplete choices', () => {
    expect(validateQuestion({ ...homeworkQuestion({ text: ' ' }), options: [] })).toMatch(/текст/);
    expect(validateQuestion({ ...homeworkQuestion({ points: -1 }), options: [] })).toMatch(/Баллы/);
    expect(validateQuestion({ ...homeworkQuestion({ points: NaN }), options: [] })).toMatch(/Баллы/);
    expect(validateQuestion({ ...homeworkQuestion({ questionType: 0 }), options: [] })).toMatch(/варианты/);
    expect(validateQuestion({ ...homeworkQuestion({ questionType: 1 }), options: [{ text: ' ', value: null, position: 0, isCorrect: true }] })).toMatch(/варианты/);
    expect(validateQuestion({ ...homeworkQuestion({ questionType: 0 }), options: [{ text: 'А', value: null, position: 0, isCorrect: false }] })).toMatch(/правильные/);
    expect(validateQuestion({ ...homeworkQuestion({ questionType: 1 }), options: [{ text: 'А', value: null, position: 0, isCorrect: false }] })).toMatch(/один/);
  });

  it('permits partial credit and incomplete private/returned drafts but requires full final grading', () => {
    const review = { submissionNumber: 1, revision: 0, returnForRevision: false, reviewComment: null, answers: [{ questionId: 11, score: 0.5, teacherComment: null, annotations: [] }] };
    expect(validateReview(review, [homeworkQuestion()], true)).toBeNull();
    expect(validateReview({ ...review, answers: [{ ...review.answers[0], score: null }] }, [homeworkQuestion()], false)).toBeNull();
    expect(validateReview({ ...review, answers: [{ ...review.answers[0], score: null }] }, [homeworkQuestion()], true)).toMatch(/каждый/);
    expect(validateReview({ ...review, returnForRevision: true, answers: [{ ...review.answers[0], score: null }] }, [homeworkQuestion()], true)).toBeNull();
    for (const score of [-1, 2, Infinity]) {
      expect(validateReview({ ...review, answers: [{ ...review.answers[0], score }] }, [homeworkQuestion()], false)).toMatch(/максимума/);
    }
    expect(validateReview(review, [], false)).toMatch(/максимума/);
  });

  it('uses server-adjusted deadline and closes editing exactly at the deadline', () => {
    const deadline = '2026-11-17T12:01:00Z';
    const now = Date.parse('2026-11-17T12:00:30Z');
    expect(remainingSeconds(deadline, 10000, now)).toBe(20);
    expect(remainingSeconds(null, 0, now)).toBeNull();
    expect(remainingSeconds(deadline, 60000, now)).toBe(0);
    expect(isAttemptEditable(homeworkAttempt({ forceSubmitAtUtc: deadline }), now)).toBe(true);
    expect(isAttemptEditable(homeworkAttempt({ forceSubmitAtUtc: deadline }), Date.parse(deadline))).toBe(false);
    expect(isAttemptEditable(homeworkAttempt({ status: 4 }), now)).toBe(true);
    expect(isAttemptEditable(homeworkAttempt({ status: 1 }), now)).toBe(false);
  });
});
