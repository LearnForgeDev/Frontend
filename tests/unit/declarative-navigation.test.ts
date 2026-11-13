import { createElement } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

afterEach(() => cleanup());

it('declarative navigation returns void for destination and history navigation', () => {
  const wrapper = ({ children }: PropsWithChildren) => createElement(MemoryRouter, { initialEntries: ['/start'] }, children);
  const { result } = renderHook(() => ({ navigate: useNavigate(), location: useLocation() }), { wrapper });
  act(() => {
    const resultValue: void = result.current.navigate('/next');
    expect(resultValue).toBeUndefined();
  });
  expect(result.current.location.pathname).toBe('/next');
  act(() => {
    const resultValue: void = result.current.navigate(-1);
    expect(resultValue).toBeUndefined();
  });
  expect(result.current.location.pathname).toBe('/start');
});
