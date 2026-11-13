import { SchedulingProvider } from '@/Services/Scheduling/components/SchedulingProvider/SchedulingProvider';
import { SchedulePageContent } from './SchedulePageContent';

export default function SchedulePage() {
  return (
    <SchedulingProvider>
      <SchedulePageContent />
    </SchedulingProvider>
  );
}
