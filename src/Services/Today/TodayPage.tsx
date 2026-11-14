import { LessonsProvider } from '@/Services/Lessons/components/LessonsProvider/LessonsProvider';
import TodayPageContent from './TodayPageContent';

export default function TodayPage() {
  return (
    <LessonsProvider>
      <TodayPageContent />
    </LessonsProvider>
  );
}
