import type { HomeworkAttemptDto, HomeworkQuestion, HomeworkQuestionInput, HomeworkReviewInput } from '@/Endpoints/Homework/homework.type';

export function validateQuestion(question: HomeworkQuestionInput) {
  if (!question.text.trim()) {
    return 'Добавьте текст вопроса.';
  }
  if (!Number.isFinite(question.points) || question.points < 0) {
    return 'Баллы должны быть неотрицательным числом.';
  }
  if (question.questionType === 0 || question.questionType === 1) {
    if (!question.options.length || question.options.some(option => !option.text.trim())) {
      return 'Заполните варианты ответа.';
    }
    const correct = question.options.filter(option => option.isCorrect).length;
    if (question.questionType === 1 ? correct !== 1 : correct < 1) {
      return question.questionType === 1 ? 'Отметьте один правильный вариант.' : 'Отметьте правильные варианты.';
    }
  }
  return null;
}

export function validateReview(review: HomeworkReviewInput, questions: HomeworkQuestion[], finish: boolean) {
  for (const answer of review.answers) {
    const question = questions.find(item => item.id === answer.questionId);
    if (!question || (answer.score !== null && (!Number.isFinite(answer.score) || answer.score < 0 || answer.score > question.points))) {
      return 'Баллы за ответ должны быть от нуля до максимума вопроса.';
    }
    if (finish && !review.returnForRevision && answer.score === null) {
      return 'Оцените каждый вопрос перед завершением проверки.';
    }
    if (answer.annotations.some(annotation => !annotation.text.trim() || ![annotation.x, annotation.y, annotation.width, annotation.height].every(Number.isFinite)
      || annotation.x < 0 || annotation.y < 0 || annotation.width <= 0 || annotation.height <= 0
      || annotation.x + annotation.width > 1 || annotation.y + annotation.height > 1)) {
      return 'Добавьте текст комментария и выделите область внутри изображения.';
    }
  }
  return null;
}

export function isAttemptEditable(attempt: HomeworkAttemptDto, now = Date.now()) {
  return (attempt.status === 0 || attempt.status === 4)
    && (!attempt.forceSubmitAtUtc || Date.parse(attempt.forceSubmitAtUtc) > now);
}

export function remainingSeconds(deadline: string | null, serverOffset: number, now = Date.now()) {
  return deadline ? Math.max(0, Math.ceil((Date.parse(deadline) - now - serverOffset) / 1000)) : null;
}
