import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { LessonsProvider } from '@/Services/Lessons/components/LessonsProvider/LessonsProvider';
import { SchedulingProvider } from '@/Services/Scheduling/components/SchedulingProvider/SchedulingProvider';
import { ChatProvider } from '@/Services/Chat/components/ChatProvider/ChatProvider';
import { useLessonsContext } from '@/Storage/LessonsContext/LessonsContext';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import { useChatContext } from '@/Storage/useChatContext/useChatContext';
import { useUser } from '@/Services/Auth/hooks/useUser';
import { useAuthFlow } from '@/Services/Auth/hooks/useAuthFlow';

afterEach(() => cleanup());

it('rejects user context access outside its provider', () => {
  expect(() => renderHook(useUser)).toThrow('useUser must be used within a UserProvider');
});

it('rejects auth form access outside its flow provider', () => {
  expect(() => renderHook(useAuthFlow)).toThrow('Форма авторизации недоступна');
});

it('shares lesson state with its public hook and isolates another provider', () => {
  const wrapper = ({ children }: PropsWithChildren) => createElement(LessonsProvider, null, children);
  const first = renderHook(useLessonsContext, { wrapper });
  const second = renderHook(useLessonsContext, { wrapper });
  act(() => {
    first.result.current.setSearch('Алгебра');
    first.result.current.setView('list');
  });
  expect(first.result.current.search).toBe('Алгебра');
  expect(first.result.current.view).toBe('list');
  expect(second.result.current.search).toBe('');
  expect(second.result.current.view).toBe('grid');
});

it('shares scheduling state with the public scheduling hook', () => {
  const wrapper = ({ children }: PropsWithChildren) => createElement(SchedulingProvider, null, children);
  const { result } = renderHook(useSchedulingContext, { wrapper });
  const date = new Date('2026-11-14T12:00:00Z');
  act(() => {
    result.current.setSelectedDate(date);
    result.current.setSelectedEventId('event');
    result.current.setView('agenda');
  });
  expect(result.current.selectedDate).toEqual(date);
  expect(result.current.selectedEventId).toBe('event');
  expect(result.current.view).toBe('agenda');
});

it('shares chat visibility with the public chat hook', () => {
  const wrapper = ({ children }: PropsWithChildren) => createElement(ChatProvider, null, children);
  const { result } = renderHook(useChatContext, { wrapper });
  expect(result.current.isMiniOpen).toBe(false);
  act(() => result.current.setMiniOpen(true));
  expect(result.current.isMiniOpen).toBe(true);
  expect(result.current.activeThread).toBeNull();
});
