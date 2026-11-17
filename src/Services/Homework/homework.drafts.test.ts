import { afterEach, describe, expect, it, vi } from 'vitest';
import { answerDraftKey, listAnswerDrafts, persistAnswerDraft, readAnswerDraft } from './homework.drafts';
import { richTextFromText } from '@/Assets/Components/RichTextEditor/RichTextEditor.utils';

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('Versioned offline homework snapshots', () => {
  it('isolates owner, school, attempt, immutable version and tab snapshots', () => {
    const prefix = answerDraftKey('student:school', 'attempt', 2, 11);
    const answer = { questionId: 11, revision: 3, textValue: 'Решение', richText: richTextFromText('Решение'), selectedOptionIds: [] };
    expect(persistAnswerDraft(`${prefix}:tab-1`, answer)).toBe(true);
    expect(readAnswerDraft(`${prefix}:tab-1`)).toEqual(answer);
    expect(listAnswerDrafts(prefix)).toHaveLength(1);
    expect(listAnswerDrafts(answerDraftKey('other:school', 'attempt', 2, 11))).toEqual([]);
    expect(listAnswerDrafts(answerDraftKey('student:school', 'attempt', 3, 11))).toEqual([]);
    persistAnswerDraft(`${prefix}:tab-2`, { ...answer, textValue: 'Другой черновик' });
    expect(listAnswerDrafts(prefix)).toHaveLength(2);
    persistAnswerDraft(`${prefix}:tab-1`, null);
    expect(readAnswerDraft(`${prefix}:tab-1`)).toBeNull();
    expect(readAnswerDraft(`${prefix}:tab-2`)?.textValue).toBe('Другой черновик');
  });

  it('rejects corrupt envelopes and parses external values without trusting their shape', () => {
    for (const value of ['{', 'null', '{}', '{"questionId":11}', '{"questionId":"11","revision":0}']) {
      localStorage.setItem('draft', value);
      expect(readAnswerDraft('draft')).toBeNull();
    }
    localStorage.setItem('draft', JSON.stringify({ questionId: 11, revision: 0, selectedOptionIds: [1, '2'], textValue: 8, richText: { format: 'html' } }));
    expect(readAnswerDraft('draft')).toEqual({ questionId: 11, revision: 0, textValue: null, richText: null, selectedOptionIds: [1] });
    localStorage.setItem('base:bad', '{');
    expect(listAnswerDrafts('base')).toEqual([]);
  });

  it('reports storage failures rather than claiming an offline draft exists', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('quota');
      },
      getItem: () => {
        throw new Error('denied');
      },
    });
    expect(persistAnswerDraft('draft', { questionId: 1, revision: 0 })).toBe(false);
    expect(readAnswerDraft('draft')).toBeNull();
  });
});
