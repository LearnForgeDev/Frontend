import { SchedulingContext } from '@/Services/Scheduling/SchedulingContext.context';
import type { SchedulingContextValue } from './SchedulingContext.type';
export type { ScheduleView, SchedulingContextValue } from './SchedulingContext.type';
import { useContext } from 'react';


export function useSchedulingContext(): SchedulingContextValue {
  const context = useContext(SchedulingContext);
  if (!context) {
    throw new Error('useSchedulingContext must be used within a SchedulingProvider');
  }
  return context;
}
