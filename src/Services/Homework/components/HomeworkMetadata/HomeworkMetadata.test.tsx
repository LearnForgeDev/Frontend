import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { homeworkDefinition, homeworkQuestion } from '../../homework.testUtils';
import HomeworkMetadata from './HomeworkMetadata';

afterEach(cleanup);

describe('Homework version settings', () => {
  it('requires a title and saves normalized values while marking unsaved changes', async () => {
    const save = vi.fn(async () => true);
    const dirty = vi.fn();
    render(<HomeworkMetadata busy={false} onSave={save} onDirtyChange={dirty} />);
    expect(screen.getByRole('button', { name: 'Создать домашнее задание' })).toHaveProperty('disabled', true);
    fireEvent.change(screen.getByRole('textbox', { name: 'Название' }), { target: { value: ' Практика ' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Описание' }), { target: { value: ' Условия ' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Проходной балл равен сумме баллов' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Проходной балл' }), { target: { value: '1.5' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Максимум попыток' }), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Срок сдачи'), { target: { value: '2026-11-18T18:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать домашнее задание' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ title: 'Практика', description: 'Условия', passingScore: 1.5, useTotalPassingScore: false, maxAttempts: 3, deadlineUtc: new Date('2026-11-18T18:00').toISOString() }));
    expect(dirty).toHaveBeenLastCalledWith(false);
  });

  it('retains settings after a failed save and rejects a fractional attempt limit', async () => {
    const dirty = vi.fn();
    render(<HomeworkMetadata definition={homeworkDefinition({ deadlineUtc: '2026-11-18T18:00:00Z' })} busy={false} onSave={async () => null} onDirtyChange={dirty} />);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Максимум попыток' }), { target: { value: '1.5' } });
    expect(screen.getByRole('button', { name: 'Сохранить настройки' })).toHaveProperty('disabled', true);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Максимум попыток' }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить настройки' }));
    await waitFor(() => expect(dirty).toHaveBeenLastCalledWith(true));
    expect(screen.getByRole('textbox', { name: 'Название' })).toHaveProperty('value', 'Домашняя работа');
  });

  it('defaults new assignments to total points and keeps the displayed threshold live after question edits', async () => {
    const save = vi.fn(async () => true);
    const { rerender } = render(<HomeworkMetadata busy={false} onSave={save} />);
    expect(screen.getByRole('checkbox', { name: 'Проходной балл равен сумме баллов' })).toHaveProperty('checked', true);
    expect(screen.getByRole('spinbutton', { name: 'Проходной балл' })).toHaveProperty('disabled', true);
    fireEvent.change(screen.getByRole('textbox', { name: 'Название' }), { target: { value: 'Практика' } });
    const definition = homeworkDefinition({ useTotalPassingScore: true, questions: [homeworkQuestion({ points: 2 })] });
    rerender(<HomeworkMetadata definition={definition} busy={false} onSave={save} />);
    expect(screen.getByRole('spinbutton', { name: 'Проходной балл' })).toHaveProperty('value', '2');
    rerender(<HomeworkMetadata definition={{ ...definition, questions: [...definition.questions, homeworkQuestion({ id: 12, points: 3 })] }} busy={false} onSave={save} />);
    expect(screen.getByRole('spinbutton', { name: 'Проходной балл' })).toHaveProperty('value', '5');
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить настройки' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ passingScore: 5, useTotalPassingScore: true })));
  });

  it('preserves an existing auto policy and permits an explicit custom zero threshold', async () => {
    const save = vi.fn(async () => true);
    render(<HomeworkMetadata definition={homeworkDefinition({ useTotalPassingScore: true, passingScore: 2, questions: [homeworkQuestion({ points: 2 })] })} busy={false} onSave={save} />);
    expect(screen.getByRole('checkbox', { name: 'Проходной балл равен сумме баллов' })).toHaveProperty('checked', true);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Проходной балл равен сумме баллов' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Проходной балл' }), { target: { value: '0' } });
    expect(screen.getByRole('button', { name: 'Сохранить настройки' })).toHaveProperty('disabled', false);
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить настройки' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ passingScore: 0, useTotalPassingScore: false })));
  });
});
