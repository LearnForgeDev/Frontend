import { createContext } from 'react';
import type { LessonsContextValue } from '@/Storage/LessonsContext/LessonsContext.type';

export const LessonsContext = createContext<LessonsContextValue | undefined>(undefined);
