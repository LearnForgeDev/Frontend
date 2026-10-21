import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCourseForm } from './courseFormReducer';
import { useCourseDismissal } from './useCourseDismissal';

afterEach(cleanup);

describe('Закрытие формы курса', () => {
  it('сохраняет заполненную форму до явного отказа от изменений', () => {
    const onClose = vi.fn();
    const initial = createCourseForm();
    const { result, rerender } = renderHook(({ form, saving }) => useCourseDismissal(form, saving, onClose), {
      initialProps: { form: initial, saving: false },
    });
    rerender({ form: { ...initial, title: 'Новый курс' }, saving: false });
    act(() => result.current.requestClose());
    expect(onClose).not.toHaveBeenCalled();
    expect(result.current.needsConfirmation).toBe(true);
    act(() => result.current.keepEditing());
    expect(result.current.needsConfirmation).toBe(false);
    act(() => result.current.requestClose());
    act(() => result.current.discard());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('не закрывает форму во время сохранения, в том числе из открытого подтверждения', () => {
    const onClose = vi.fn();
    const form = createCourseForm();
    const { result, rerender } = renderHook(({ saving }) => useCourseDismissal(form, saving, onClose), { initialProps: { saving: true } });
    act(() => result.current.requestClose());
    act(() => result.current.discard());
    expect(onClose).not.toHaveBeenCalled();
    rerender({ saving: false });
    act(() => result.current.requestClose());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('учитывает порядок уроков и аудиторию, но не текст ошибки', () => {
    const onClose = vi.fn();
    const initial = createCourseForm();
    const { result, rerender } = renderHook(({ form }) => useCourseDismissal(form, false, onClose), { initialProps: { form: initial } });
    rerender({ form: { ...initial, error: 'Заполните название' } });
    act(() => result.current.requestClose());
    expect(onClose).toHaveBeenCalledOnce();
    rerender({ form: { ...initial, lessonIds: [2, 1], studentPublicIds: ['student'] } });
    act(() => result.current.requestClose());
    expect(onClose).toHaveBeenCalledOnce();
    expect(result.current.needsConfirmation).toBe(true);
  });
});
