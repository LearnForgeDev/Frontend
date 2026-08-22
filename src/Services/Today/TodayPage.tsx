import { LessonsProvider } from '@/Storage/LessonsContext/LessonsContext';
import TodayPageContent from './TodayPageContent';

export default function TodayPage() {
  return (
    <LessonsProvider>
      <TodayPageContent />
    </LessonsProvider>
  );
}
