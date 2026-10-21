import { beforeEach, describe, expect, it } from 'vitest';
import { clearSavedLessonDraft, normalizeLessonDocument, readLessonDraft, writeLessonDraft } from '../../src/Services/Lessons/hooks/useLessonEditor/useLessonEditor.utils';
import { validateLessonTitle } from '../../src/Services/Lessons/validation/lessonTitle';

const scope = { userPublicId: 'teacher', schoolPublicId: 'school', lessonId: '1' };
const document = normalizeLessonDocument({ root: { type: 'root', children: [], version: 1 } })!;

describe('Черновик урока', () => {
  beforeEach(() => localStorage.clear());

  it('изолирован по пользователю, школе и уроку', () => {
    writeLessonDraft(scope, document);
    expect(readLessonDraft(scope)?.document).toEqual(document);
    expect(readLessonDraft({ ...scope, userPublicId: 'student' })).toBeUndefined();
    expect(readLessonDraft({ ...scope, schoolPublicId: 'other' })).toBeUndefined();
    expect(readLessonDraft({ ...scope, lessonId: '2' })).toBeUndefined();
  });

  it('сохранение старой версии не удаляет более новый черновик', () => {
    const newer = normalizeLessonDocument({ root: { type: 'root', children: [{ type: 'paragraph', children: [] }], version: 1 } })!;
    writeLessonDraft(scope, newer);
    clearSavedLessonDraft(scope, document);
    expect(readLessonDraft(scope)?.document).toEqual(newer);
    clearSavedLessonDraft(scope, newer);
    expect(readLessonDraft(scope)).toBeUndefined();
  });

  it('сохраняет версию, на основе которой началось редактирование', () => {
    writeLessonDraft(scope, document, 'lessons:original');
    expect(readLessonDraft(scope)?.storageKey).toBe('lessons:original');
  });

  it('отклоняет пустое и слишком длинное название', () => {
    expect(validateLessonTitle('  ')).toBeTruthy();
    expect(validateLessonTitle('а'.repeat(201))).toBeTruthy();
    expect(validateLessonTitle('  Алгебра  ')).toBeNull();
  });
});
