import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { SerializedDocument } from '@lexical/file';
import ErrorBoundary from '@/Assets/Components/ErrorBoundary/ErrorBoundary';
import LessonEditorContainer from '@/Services/Lessons/components/LessonEditorContainer/LessonEditorContainer';
import CourseLessonContent from './CourseLessonContent';

const logoutToLogin = vi.hoisted(() => vi.fn());
vi.mock('@/Services/Auth/hooks/useLogout/useLogout', () => ({ logoutToLogin }));
vi.mock('@/Services/Lessons/components/TextEditor/TextEditor', () => {
  throw new Error('Editor chunk failed to download');
});
vi.mock('@/Services/Lessons/hooks/useLessonEditing', () => ({
  useLessonEditing: () => ({ hasConflict: false, storageFailed: false, status: 'saved', recordDraft: vi.fn(), saveDocument: vi.fn() }),
}));
const document: SerializedDocument = {
  editorState: { root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 } },
  lastSaved: 0, source: 'LearnForge', version: 'test',
};

afterEach(() => {
  cleanup();
  logoutToLogin.mockClear();
});

it.each(['course', 'lesson'])('offers recovery when the %s editor import fails', async owner => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const editor = owner === 'course'
    ? <CourseLessonContent lessonId="lesson" content={document} />
    : <LessonEditorContainer schoolPublicId="school" lesson={{ id: 'lesson', publicId: 'lesson', title: 'Урок' }} document={document} isEditMode />;
  render(<ErrorBoundary>{editor}</ErrorBoundary>);
  expect(await screen.findByRole('button', { name: 'Обновить страницу' })).toBeTruthy();
  fireEvent.click(screen.getByTestId('error-boundary-login'));
  expect(logoutToLogin).toHaveBeenCalledOnce();
  expect(screen.queryByLabelText('Загрузка редактора')).toBeNull();
  expect(screen.queryByLabelText('Загрузка урока')).toBeNull();
});
