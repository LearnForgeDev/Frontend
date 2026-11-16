import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import type { RichTextEditorProps } from '@/Assets/Components/RichTextEditor/RichTextEditor.type';
import { richTextFromText } from '@/Assets/Components/RichTextEditor/RichTextEditor.utils';
import { createApplicationStore } from '@/Storage/Application/application.store';
import HomeworkQuestionEditor from './HomeworkQuestionEditor';

vi.mock('@/Services/Auth/hooks/useUser', () => ({ useUser: () => ({ user: { userPublicId: 'teacher' } }) }));
vi.mock('next/dynamic', () => ({ default: () => function Editor({ label, onChange, readOnly }: RichTextEditorProps) {
  return <textarea aria-label={label} disabled={readOnly} onChange={event => onChange?.(richTextFromText(event.target.value), event.target.value)} />;
} }));
afterEach(cleanup);

describe('Teacher question authoring', () => {
  it('starts with one point, emits a rich prompt and clears the saved draft', async () => {
    const store = createApplicationStore();
    const save = vi.fn(async () => true);
    render(<Provider store={store}><MemoryRouter><HomeworkQuestionEditor homeworkId="homework" version={2} question={null} position={3} busy={false} onSave={save} onCancel={vi.fn()} /></MemoryRouter></Provider>);
    expect(screen.getByRole('spinbutton', { name: 'Максимум баллов' })).toHaveProperty('value', '1');
    expect(screen.getByRole('button', { name: 'Сохранить вопрос' })).toHaveProperty('disabled', true);
    fireEvent.change(screen.getByRole('textbox', { name: 'Текст вопроса' }), { target: { value: 'Объясните шаги' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить вопрос' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ position: 3, text: 'Объясните шаги', points: 1, questionType: 3, richText: expect.objectContaining({ format: 'lexical', version: 1 }) })));
    expect(store.getState().homework.scopes['teacher:'].questionDrafts).toEqual({});
  });

  it('keeps choice keys exclusive for radio, supports custom weights and separate hints', async () => {
    const save = vi.fn(async () => true);
    render(<Provider store={createApplicationStore()}><MemoryRouter><HomeworkQuestionEditor homeworkId="homework" version={1} question={null} position={0} busy={false} onSave={save} onCancel={vi.fn()} /></MemoryRouter></Provider>);
    fireEvent.change(screen.getByRole('textbox', { name: 'Текст вопроса' }), { target: { value: 'Выберите' } });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Тип ответа' }));
    fireEvent.click(screen.getByRole('option', { name: 'Один вариант' }));
    fireEvent.click(screen.getByRole('button', { name: 'Добавить вариант' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Вариант 1' }), { target: { value: 'Первый' } });
    fireEvent.click(screen.getByRole('button', { name: 'Добавить вариант' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Вариант 2' }), { target: { value: 'Второй' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Правильный вариант 1' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Правильный вариант 2' }));
    expect(screen.getByRole('checkbox', { name: 'Правильный вариант 1' })).toHaveProperty('checked', false);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Максимум баллов' }), { target: { value: '2.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Настроить подсказки' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Подсказка ученику' }), { target: { value: 'Совет ученику' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Подсказка преподавателю' }), { target: { value: 'Ключ учителя' } });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить вопрос' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ points: 2.5, studentHint: 'Совет ученику', teacherHint: 'Ключ учителя', questionType: 1, options: [expect.objectContaining({ text: 'Первый', isCorrect: false }), expect.objectContaining({ text: 'Второй', isCorrect: true })] })));
  });

  it('discards question edits explicitly on cancel', () => {
    const cancel = vi.fn();
    const store = createApplicationStore();
    render(<Provider store={store}><MemoryRouter><HomeworkQuestionEditor homeworkId="homework" version={1} question={null} position={0} busy={false} onSave={async () => true} onCancel={cancel} /></MemoryRouter></Provider>);
    fireEvent.change(screen.getByRole('textbox', { name: 'Текст вопроса' }), { target: { value: 'Черновик' } });
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
    expect(cancel).toHaveBeenCalledOnce();
    expect(store.getState().homework.scopes['teacher:'].questionDrafts).toEqual({});
  });
});
