import ErrorBoundary from '@/Assets/Components/ErrorBoundary/ErrorBoundary';
import { LessonsProvider } from '@/Storage/LessonsContext/LessonsContext';
import LessonsWorkspace from './components/LessonsWorkspace/LessonsWorkspace';
import type { LessonsMainPageProps } from './LessonsMainPage.types';
import './LessonsMainPage.css';

export default function LessonsMainPage(props: LessonsMainPageProps) {
  return <ErrorBoundary><LessonsProvider><LessonsWorkspace {...props} /></LessonsProvider></ErrorBoundary>;
}
