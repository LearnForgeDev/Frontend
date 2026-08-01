import { SchedulingProvider } from '@/Storage/SchedulingContext/SchedulingContext.tsx';
import { SchedulePageContent } from './SchedulePageContent';

export default function SchedulePage() {
  return (
    <SchedulingProvider>
      <SchedulePageContent />
    </SchedulingProvider>
  );
}
