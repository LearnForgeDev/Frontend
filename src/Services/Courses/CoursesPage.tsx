import { useParams } from 'react-router-dom';
import CoursesWorkspace from './components/CoursesWorkspace/CoursesWorkspace';

export default function CoursesPage() {
  const { schoolPublicId = '' } = useParams();
  return <CoursesWorkspace key={schoolPublicId} schoolPublicId={schoolPublicId} />;
}
