import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { homeworkAttempt, homeworkDefinition } from './homework.testUtils';
import HomeworkAttemptPage from './HomeworkAttemptPage';

vi.mock('./hooks/useHomeworkAttempt', () => ({
  useHomeworkAttempt: () => ({
    attempt: homeworkAttempt({ homework: homeworkDefinition({ questions: [] }) }),
    schoolPublicId: 'school', state: { error: null }, editable: false,
    dirty: false, conflicted: [], seconds: null,
  }),
}));
vi.mock('./components/HomeworkQuestionView/HomeworkQuestionView', () => ({ default: () => null }));
vi.mock('./components/HomeworkStudentAnswer/HomeworkStudentAnswer', () => ({ default: () => null }));

function CurrentLocation() {
  const location = useLocation();
  return <output data-testid="return-location">{location.pathname}{location.search}</output>;
}

afterEach(cleanup);

describe('Homework attempt back navigation', () => {
  it.each([
    ['course=course-1&item=item-1', 'Вернуться к курсу', '/app/schools/school/courses/course-1?item=item-1'],
    ['course=course-only', 'Вернуться к курсу', '/app/schools/school/courses/course-only'],
    ['course=course%20%2F1&item=item%20%2F2', 'Вернуться к курсу', '/app/schools/school/courses/course%20%2F1?item=item%20%2F2'],
    ['', 'К заданию', '/app/schools/school/homework/homework-1'],
    ['tab=history', 'К заданию', '/app/schools/school/homework/homework-1?tab=history'],
    ['item=orphan', 'К заданию', '/app/schools/school/homework/homework-1?item=orphan'],
  ])('returns from %s to its originating resource', (query, label, expectedPath) => {
    render(<MemoryRouter initialEntries={[`/app/schools/school/homework/homework-1/attempts/attempt-1?${query}`]}>
      <HomeworkAttemptPage /><CurrentLocation />
    </MemoryRouter>);
    const back = screen.getByRole('button', { name: label });
    expect(back.closest('header')).not.toBeNull();
    expect(back.textContent).toBe('');
    expect(back.getAttribute('title')).toBe(label);
    fireEvent.click(back);
    expect(screen.getByTestId('return-location').textContent).toBe(expectedPath);
  });
});
