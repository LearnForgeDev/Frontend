import { homeworkActions } from '@/Storage/Homework/homework.slice';
import type { HomeworkQuestion, HomeworkQuestionInput } from '@/Endpoints/Homework/homework.type';
import { useHomeworkScope } from './useHomeworkScope';

export function useHomeworkQuestion(homeworkId: string, version: number, question: HomeworkQuestion | null, position: number) {
  const { state, scope, dispatch } = useHomeworkScope();
  const key = `${homeworkId}:${version}:${question?.id ?? 'new'}`;
  const initial: HomeworkQuestionInput = question ? {
    ...question,
    options: question.options.map(option => ({ ...option, isCorrect: option.isCorrect ?? false })),
  } : { position, text: '', richText: null, questionType: 3, isRequired: true, points: 1, studentHint: '', teacherHint: '', validationJson: null, options: [] };
  return {
    question: state.questionDrafts[key] ?? initial,
    dirty: Boolean(state.questionDrafts[key]),
    change: (value: HomeworkQuestionInput) => dispatch(homeworkActions.questionDraftChanged({ scope, key, question: value })),
    clear: () => dispatch(homeworkActions.questionDraftChanged({ scope, key, question: null })),
  };
}
