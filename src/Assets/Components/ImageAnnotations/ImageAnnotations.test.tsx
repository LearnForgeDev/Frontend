import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ImageAnnotations from './ImageAnnotations';
import { boundRectangle, imagePoint, imageRectangle } from './ImageAnnotations.utils';
import type { ImageAnnotation } from './ImageAnnotations.type';

function Editor() {
  const [annotations, setAnnotations] = useState<ImageAnnotation[]>([]);
  return <ImageAnnotations src="/answer.png" alt="Решение" filePublicId="file-1" annotations={annotations} onChange={setAnnotations} />;
}

afterEach(cleanup);

describe('image regions', () => {
  it('creates and edits a region entirely with keyboard-addressable controls', () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: 'Добавить область' }));
    fireEvent.change(screen.getByLabelText('Комментарий к области'), { target: { value: 'Проверьте знак' } });
    fireEvent.change(screen.getByLabelText('Слева, %'), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText('Ширина, %'), { target: { value: '25' } });
    expect(getComputedStyle(screen.getByRole('button', { name: 'Область 1: Проверьте знак' })).left).toBe('90%');
    expect(screen.getByLabelText('Ширина, %').getAttribute('value')).toBe('10');
    fireEvent.click(screen.getByRole('button', { name: 'Удалить область' }));
    expect(screen.queryByRole('list', { name: 'Комментарии к областям' })).toBeNull();
  });

  it('shows released feedback without modification controls', () => {
    render(<ImageAnnotations src="/answer.png" alt="Решение" filePublicId="file-1" readOnly annotations={[{ publicId: 'region', filePublicId: 'file-1', x: 0.2, y: 0.3, width: 0.2, height: 0.1, text: 'Верно' }]} />);
    expect(screen.getByRole('button', { name: 'Область 1: Верно' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Добавить область' })).toBeNull();
    expect(screen.queryByLabelText('Комментарий к области')).toBeNull();
  });

  it('draws a region over the actual image rectangle and cancels an unfinished selection', () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: 'Выделить на изображении' }));
    const image = screen.getByAltText('Решение');
    const canvas = image.parentElement;
    if (!canvas) {
      throw new Error('Expected an image selection canvas');
    }
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    fireEvent(canvas, new MouseEvent('pointerdown', { bubbles: true, clientX: 20, clientY: 10, button: 0 }));
    fireEvent(canvas, new MouseEvent('pointermove', { bubbles: true, clientX: 120, clientY: 60 }));
    fireEvent(canvas, new MouseEvent('pointerup', { bubbles: true, clientX: 120, clientY: 60 }));
    expect(screen.getByLabelText('Слева, %').getAttribute('value')).toBe('10');
    expect(screen.getByLabelText('Ширина, %').getAttribute('value')).toBe('50');
    fireEvent.click(screen.getByRole('button', { name: 'Выделить на изображении' }));
    fireEvent.keyDown(canvas, { key: 'Escape' });
    expect(screen.queryByText('Проведите по изображению, чтобы выделить область. Escape отменяет выделение.')).toBeNull();
  });

  it('normalizes image coordinates independently of rendered size and drawing direction', () => {
    expect(imagePoint({ x: 210, y: 120 }, { left: 10, top: 20, width: 400, height: 200 })).toEqual({ x: 0.5, y: 0.5 });
    expect(imagePoint({ x: 410, y: 220 }, { left: 10, top: 20, width: 800, height: 400 })).toEqual({ x: 0.5, y: 0.5 });
    expect(imageRectangle({ x: 0.8, y: 0.6 }, { x: 0.2, y: 0.1 })).toEqual({ x: 0.2, y: 0.1, width: 0.6000000000000001, height: 0.5 });
    expect(boundRectangle({ x: 0.9, y: 0.9, width: 0.5, height: 0.5 }).width).toBeCloseTo(0.1);
  });
});
