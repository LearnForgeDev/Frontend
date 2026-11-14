import { LessonsContext } from '@/Services/Lessons/LessonsContext.context';
import type { LessonsContextValue } from './LessonsContext.type';
export type { LessonsContextValue } from './LessonsContext.type';
import { useContext } from 'react';


export function useLessonsContext(): LessonsContextValue {
  const context = useContext(LessonsContext);
  if (!context) {
    throw new Error('useLessonsContext must be used within a LessonsProvider');
  }
  return context;
}
