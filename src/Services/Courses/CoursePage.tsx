import { useParams } from 'react-router-dom';
import CourseWorkspace from './components/CourseWorkspace/CourseWorkspace';

export default function CoursePage() {
  const { schoolPublicId = '', coursePublicId = '' } = useParams();
  return <CourseWorkspace key={`${schoolPublicId}/${coursePublicId}`} schoolPublicId={schoolPublicId} coursePublicId={coursePublicId} />;
}
