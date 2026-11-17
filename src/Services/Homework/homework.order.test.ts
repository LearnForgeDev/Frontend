import { describe, expect, it } from 'vitest';
import { nextHomeworkPosition } from './homework.order';

describe('Appending ordered homework questions and images', () => {
  it('uses a free position after deleting the middle question or image', () => {
    const items = [{ position: 0 }, { position: 1 }, { position: 2 }];
    const remaining = items.filter(item => item.position !== 1);
    expect(nextHomeworkPosition(remaining)).toBe(3);
    expect(nextHomeworkPosition([])).toBe(0);
    expect(nextHomeworkPosition([{ position: 5 }, { position: 1 }])).toBe(6);
  });
});
