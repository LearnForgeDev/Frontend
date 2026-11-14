import ErrorBoundary from '@/Assets/Components/ErrorBoundary/ErrorBoundary';
import { LessonsProvider } from '@/Services/Lessons/components/LessonsProvider/LessonsProvider';
import LessonsWorkspace from './components/LessonsWorkspace/LessonsWorkspace';
import type { LessonsMainPageProps } from './LessonsMainPage.type';

export default function LessonsMainPage(props: LessonsMainPageProps) {
  return <ErrorBoundary><LessonsProvider><LessonsWorkspace {...props} /></LessonsProvider></ErrorBoundary>;
}
