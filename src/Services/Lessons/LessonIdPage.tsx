import { useParams, useSearchParams } from 'react-router-dom';
import LessonWorkspace from './components/LessonWorkspace/LessonWorkspace';

export default function LessonIdPage() {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();
  return <LessonWorkspace key={lessonId} lessonId={lessonId} requestedEditMode={searchParams.get('edit') === 'true'} />;
}
