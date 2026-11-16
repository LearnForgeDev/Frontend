import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { homeworkDefinition } from '../../homework.testUtils';
import HomeworkAudience from './HomeworkAudience';

vi.mock('../../hooks/useHomeworkAudience', () => ({ useHomeworkAudience: () => ({ students: [{ publicId: 'student', name: 'Анна' }], groups: [{ id: 3, name: 'Группа 3' }] }) }));
afterEach(cleanup);

describe('Homework explicit audience selection', () => {
  it('retains public identities omitted from a partial roster read', async () => {
    const save = vi.fn(async () => undefined);
    render(<HomeworkAudience definition={homeworkDefinition({ allowedUserPublicIds: ['missing'], allowedGroupIds: [99] })} busy={false} onSave={save} />);
    expect(screen.getByText('missing')).toBeTruthy();
    expect(screen.getByText('Группа 99')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить доступ' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ allowedUserPublicIds: ['missing'], allowedGroupIds: [99] }));
  });

  it('selects roster identities and marks access dirty before saving', async () => {
    const save = vi.fn(async () => true);
    const dirty = vi.fn();
    render(<HomeworkAudience definition={homeworkDefinition({ allowedUserPublicIds: [] })} busy={false} onSave={save} onDirtyChange={dirty} />);
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Ученики' }));
    fireEvent.click(screen.getByRole('option', { name: 'Анна' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Группы' }));
    fireEvent.click(screen.getByRole('option', { name: 'Группа 3' }));
    expect(dirty).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить доступ' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ allowedUserPublicIds: ['student'], allowedGroupIds: [3] }));
    expect(dirty).toHaveBeenLastCalledWith(false);
  });
});
