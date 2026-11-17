import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RichTextEditorProps } from '@/Assets/Components/RichTextEditor/RichTextEditor.type';
import { richTextFromText } from '@/Assets/Components/RichTextEditor/RichTextEditor.utils';
import { homeworkQuestion } from '../../homework.testUtils';
import HomeworkStudentAnswer from './HomeworkStudentAnswer';

vi.mock('next/dynamic', () => ({ default: () => function Editor({ label, onChange, readOnly }: RichTextEditorProps) {
  return <textarea aria-label={label} disabled={readOnly} onChange={event => onChange?.(richTextFromText(event.target.value), event.target.value)} />;
} }));
vi.mock('../HomeworkAttachment/HomeworkAttachment', () => ({ default: ({ file, onRemove }: { file: { fileName: string }; onRemove?: () => void }) => <button onClick={onRemove}>{file.fileName}</button> }));
afterEach(cleanup);

const common = { schoolPublicId: 'school', homeworkPublicId: 'homework', attemptPublicId: 'attempt', disabled: false, busy: false, onUpload: vi.fn(), onRemoveFile: vi.fn() };

describe('Typed and handwritten question responses', () => {
  it('submits distinct checklist selections and radio IDs', () => {
    const onChange = vi.fn();
    const options = [{ id: 1, position: 0, text: 'А', value: null }, { id: 2, position: 1, text: 'Б', value: null }];
    render(<HomeworkStudentAnswer {...common} question={homeworkQuestion({ questionType: 0, options })} draft={{ questionId: 11, selectedOptionIds: [1] }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Б' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ selectedOptionIds: [1, 2] }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'А' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ selectedOptionIds: [] }));
    cleanup();
    render(<HomeworkStudentAnswer {...common} question={homeworkQuestion({ questionType: 1, options })} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'А' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ selectedOptionIds: [1] }));
  });

  it('preserves plain fallback alongside rich answers and emits short answers', () => {
    const onChange = vi.fn();
    render(<HomeworkStudentAnswer {...common} question={homeworkQuestion({ questionType: 2 })} onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Ваш ответ' }), { target: { value: '42' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ questionId: 11, textValue: '42' }));
    cleanup();
    render(<HomeworkStudentAnswer {...common} question={homeworkQuestion()} onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Ваш развёрнутый ответ' }), { target: { value: 'Рассуждение' } });
    expect(onChange).toHaveBeenLastCalledWith({ questionId: 11, textValue: 'Рассуждение', richText: richTextFromText('Рассуждение'), selectedOptionIds: [] });
  });

  it('uploads only file-answer attachments and displays released teacher feedback', () => {
    const onUpload = vi.fn();
    const onRemoveFile = vi.fn();
    const answer = { questionId: 11, revision: 0, textValue: null, richText: null, selectedOptionIds: [], score: 0.5, isCorrect: false, teacherComment: 'Проверьте второй шаг', files: [{ publicId: 'file', fileName: 'work.png', sizeBytes: 5, mimeType: 'image/png' }], annotations: [] };
    const { container } = render(<HomeworkStudentAnswer {...common} question={homeworkQuestion({ questionType: 4 })} answer={answer} onChange={vi.fn()} onUpload={onUpload} onRemoveFile={onRemoveFile} />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    if (input) {
      const file = new File(['work'], 'work.png', { type: 'image/png' });
      fireEvent.change(input, { target: { files: [file] } });
      expect(onUpload).toHaveBeenCalledWith(file);
    }
    fireEvent.click(screen.getByRole('button', { name: 'work.png' }));
    expect(onRemoveFile).toHaveBeenCalledWith('file');
    expect(screen.getByText('Проверьте второй шаг')).toBeTruthy();
    expect(screen.getByText('Баллы: 0.5 / 1')).toBeTruthy();
  });
});
