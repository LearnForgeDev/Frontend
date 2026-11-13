import { createContext } from 'react';
import type { SchedulingContextValue } from '@/Storage/SchedulingContext/SchedulingContext.type';

export const SchedulingContext = createContext<SchedulingContextValue | undefined>(undefined);
